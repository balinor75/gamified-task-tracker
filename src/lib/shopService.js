import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

const STATS_COL = 'user_stats';

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
    
    if (!statsDoc.exists()) {
      throw new Error("Stats doc does not exist!");
    }

    const data = statsDoc.data();
    const currentCoins = data.coins || 0;

    if (currentCoins < price) {
      throw new InsufficientFundsError("Non hai abbastanza Monete d'Oro!");
    }

    const currentInventory = data.inventory || {};
    const itemRecord = currentInventory[itemId] || { quantity: 0 };

    // Esegui la transazione
    transaction.update(statsRef, {
      coins: currentCoins - price,
      inventory: {
        ...currentInventory,
        [itemId]: {
          quantity: itemRecord.quantity + 1,
        }
      }
    });
  });
}
