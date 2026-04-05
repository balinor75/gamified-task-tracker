import { doc, runTransaction, deleteField, collection, addDoc, getDocs, query, where, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const STATS_COL = 'user_stats';
const REWARDS_COL = 'custom_rewards';

export class InsufficientFundsError extends Error {
  constructor(message) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

/**
 * Buys an item via a Firestore Transaction to avoid race conditions.
 * @param {string} uid The user ID
 * @param {string} itemId The item ID (e.g. 'health_potion')
 * @param {number} price The cost in coins
 */
export async function buyItem(uid, itemId, price) {
  const statsRef = doc(db, STATS_COL, uid);

  await runTransaction(db, async (transaction) => {
    const statsDoc = await transaction.get(statsRef);
    if (price < 0) throw new Error("Prezzo non valido");

    const stats = statsDoc.exists() ? statsDoc.data() : {
      coins: 0,
      inventory: {},
      user_id: uid
    };

    const currentCoins = stats.coins || 0;

    if (currentCoins < price) {
      throw new InsufficientFundsError("Non hai abbastanza Monete d'Oro!");
    }

    const currentInventory = stats.inventory || {};
    const itemRecord = currentInventory[itemId] || { quantity: 0 };

    if (!statsDoc.exists()) {
      transaction.set(statsRef, {
        ...stats,
        coins: currentCoins - price,
        inventory: {
          [itemId]: { quantity: 1 }
        }
      });
    } else {
      transaction.update(statsRef, {
        coins: currentCoins - price,
        inventory: {
          ...currentInventory,
          [itemId]: {
            quantity: itemRecord.quantity + 1,
          }
        }
      });
    }
  });
}

/**
 * Consume an item and apply its effects
 */
export async function consumeItem(uid, itemId, isCustom = false) {
  const statsRef = doc(db, STATS_COL, uid);

  await runTransaction(db, async (transaction) => {
    const statsDoc = await transaction.get(statsRef);
    if (!statsDoc.exists()) throw new Error("Stats not found");

    const stats = statsDoc.data();
    const currentInventory = stats.inventory || {};
    const itemRecord = currentInventory[itemId];
    
    if (!itemRecord || itemRecord.quantity <= 0) {
      throw new Error("Oggetto non presente nell'inventario");
    }

    // Prepare inventory updates
    const newQuantity = itemRecord.quantity - 1;
    const updates = {};
    
    if (newQuantity === 0) {
      updates[`inventory.${itemId}`] = deleteField();
      // Workaround per transaction.update con nested deleteField
      // La transaction update supporta la dot notation.
    } else {
      updates[`inventory.${itemId}.quantity`] = newQuantity;
    }

    if (!isCustom) {
      if (itemId === 'health_potion') {
        // Ripristina la streak precedente
        const prev = stats.previous_streak || 0;
        const curr = stats.current_streak || 0;
        updates.current_streak = (prev > curr) ? prev : (curr > 0 ? curr : 1);
      } else if (itemId === 'focus_elixir') {
        // Attiva buff XP x2 per 24h
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);
        updates['active_buffs.double_xp_until'] = Timestamp.fromDate(tomorrow);
      }
      // 'resurrect_scroll' — logica futura (selezione task con deadline da UI)
    }

    transaction.update(statsRef, updates);
  });
}

// ==========================================
// Custom Rewards (Bazar dei Desideri)
// ==========================================

export async function createCustomReward(uid, name, price, icon) {
  const coll = collection(db, REWARDS_COL);
  const newReward = {
    user_id: uid,
    name,
    price: Number(price),
    icon,
    created_at: new Date()
  };
  await addDoc(coll, newReward);
}

export async function getCustomRewards(uid) {
  const coll = collection(db, REWARDS_COL);
  const q = query(coll, where("user_id", "==", uid));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a,b) => b.created_at - a.created_at);
}

export async function deleteCustomReward(rewardId) {
  const ref = doc(db, REWARDS_COL, rewardId);
  await deleteDoc(ref);
}
