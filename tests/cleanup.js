import { userCleanup, connectDatabase } from '../src/database.js';

const runCleanup = async () => {
  await connectDatabase(); // Menghubungkan ke database
  await userCleanup(); // Menjalankan fungsi cleanup
  process.exit(0); // Keluar setelah selesai
};

runCleanup().catch((error) => {
  console.error('Error during cleanup', error);
  process.exit(1);
});
