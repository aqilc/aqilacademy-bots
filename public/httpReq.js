
const hr = {
  set: {
    user(obj) {
      if(!obj)
        throw new Error("No editing parameters specified");

      let validParams = ["id", "points", "realpoints"], params = [], id = "";
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
  GET(url) {
    return new Promise(function (res, rej) {
      let req = new XMLHttpRequest();

      req.responseType = "json";
      req.onreadystatechange = function () {
        if (req.readyState === XMLHttpRequest.DONE)
          res(this.response);
      };

      req.open("GET", url);
      req.send();
    });
  },
  get: {
    user(id) {
      if(!id || typeof id !== "string" || (id !== "all" && id.length !== 18))
        throw new Error("Invalid ID Input");
      
      return hr.GET("/db/get/users/" + id);
    },
    ausers() {
      return hr.GET("/db/get/users/all");
    },
    blacklist() {
      return hr.GET("/db/get/black/");
    },
  },
  create: {},
  delete: {},
};