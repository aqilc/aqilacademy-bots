const hr = {
  set: {
    user(obj) {
      if(!obj)
        throw new Error("No editing parameters specified");

      let validParams = ["id", "points", "realpoints"], params = "", id = "";
      if(obj.id) {
        id = obj.id;
        delete obj.id;
      } else
        throw new Error("ID not provided when changing the 'users' database");

      if(obj === {})
        throw new Error("Nothing to edit");
      
      for(let i in obj) {
        if(!validParams.includes(i))
          throw new Error("Invalid User Database Change");

        params.push(`${i}=${obj[i]}`);
      }

      let req = new XMLHttpRequest();
      req.open("PUT", `/db/run/users/${id}?` + params.join("&"));
      req.send();
    },
  },
  get: {
    user(id) {
      return new Promise(function (res, err) {
        
      });
    }
  },
  create: {},
  delete: {},
};