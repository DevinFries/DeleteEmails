function purgeGmail() {
  const startTime = new Date();
  Logger.log(`Script started at: ${startTime}\n---`);

  const searchQuery = "Merrell@email.merrell.com"; // More precise query
  const MAX_RUNTIME_MINUTES = 5.5; // Stay under Apps Script's 6-minute limit
  const BATCH_SIZE = 500; // Max allowed by GmailApp.search()
  const SAFETY_LIMIT = 10000; // Prevent infinite loops
  let totalDeleted = 0;

  try {
    for (let i = 0; i < SAFETY_LIMIT; i++) {
      if ((new Date() - startTime) > MAX_RUNTIME_MINUTES * 60 * 1000) {
        Logger.log("Stopping due to time limit");
        break;
      }

      const threads = GmailApp.search(searchQuery, 0, BATCH_SIZE);
      if (threads.length === 0) {
        Logger.log("No more messages found");
        break;
      }

      GmailApp.moveThreadsToTrash(threads);
      totalDeleted += threads.length;
      
      Logger.log(`Deleted ${threads.length} threads (Total: ${totalDeleted})`);
      
      // Cleanup to prevent memory leaks
      Utilities.sleep(250); // Reduced sleep time but added quota management
      GmailApp.getTrashThreads()[0]?.refresh(); // Helps refresh quota
    }
  } catch (error) {
    Logger.log(`Error: ${error.toString()}\nStack: ${error.stack}`);
  } finally {
    const duration = ((new Date() - startTime) / 1000).toFixed(1);
    Logger.log(`Finished!\nTotal deleted: ${totalDeleted}\nDuration: ${duration}s`);
    
    // Optional: Empty trash (uncomment if needed)
    // if (totalDeleted > 0) GmailApp.emptyTrash();
  }
}
