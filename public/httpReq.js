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
      req.open("PUT", `/db/set/users/${id}?` + params.join("&"));
      req.send();
    },
  },
  get: {
    user(id) {
      if(!id || typeof id !== "string" || id.length !== 18)
        throw new Error("Invalid ID Input");
      
      return new Promise(function (res, rej) {
        let req = new XMLHttpRequest();
        
        req.responseType = "json";
        req.onreadystatechange = function () {
          if (req.readyState === XMLHttpRequest.DONE)
            res(this.response);
        };
        
        req.open("GET", "/db/get/users/" + id);
        req.send();
      });
    },
    ausers() {
      return new Promise(function (res, rej) {
        let req = new XMLHttpRequest();
        
        req.responseType = "json";
        req.onreadystatechange = function () {
          if (req.readyState === XMLHttpRequest.DONE)
            res(this.response);
        };
        
        req.open("GET", "/db/get/users/all");
        req.send();
      });
    },
    blacklist() {
      return new Promise(function (res, rej) {
        let req = new XMLHttpRequest();
        
        req.responseType = "json";
        req.onreadystatechange = function () {
          if (req.readyState === XMLHttpRequest.DONE)
            res(this.response);
        };
        
        req.open("GET", "/db/get/black");
        req.send();
        
      });
    },
  },
  create: {},
  delete: {},
};