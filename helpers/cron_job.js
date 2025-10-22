const cron = require("node-cron");
const { Category } = require("../models/category");
const { Product } = require("../models/product");

cron.schedule("35 16 * * *", async function () {
  try {
    const categoriesToBeDeleted = await Category.find({
      markedForDeletion: true,
    });

    for (const category of categoriesToBeDeleted) {
      const categoryProductCount = await Product.countDocuments({
        category: category.id,
      });
      if (categoryProductCount < 1) await category.deleteOne();
    }
    console.log("CRON job comepleted", new Date());
  } catch (error) {
    console.error("CRON job error:", error);
  }
});
