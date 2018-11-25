const sql = require("sqlite")
  .open("./rpg/.db/sqlite.db");

class RPG {
  constructor(id) {
    
  }
  static async get(id, table) {
    try {
      return await sql.get(`SELECT * FROM ${table} WHERE id = "${id}";`);
    } catch(err) { return new Error(err); }
  }
  static async getStats(id) {
    let stats = this.get(id, "users");
    return stats.data;
  }
}
module.exports = RPG;