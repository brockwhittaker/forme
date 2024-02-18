const run = (() => {
  const proto = {
    receiveData: () => {
      return new Promise((resolve, reject) => {
        try {
          pubSub.subscribe((data) => {
            if (data === "abort") {
              reject("error");
            } else {
              resolve(data);
            }
          });
        } catch (e) {
          console.log("error");
        }
      });
    },
  };

  return async (fn) => {
    let flag = true;
    while (flag) {
      await fn(
        () =>
          new Promise((resolve, reject) => {
            proto
              .receiveData()
              .then((value) => {
                flag = false;
                resolve(value);
              })
              .catch(() => {
                console.log("retry");
              });
          })
      );
    }
  };
})();

const pubSub = {
  susbscriber: null,
  subscribe: (fn) => {
    pubSub.susbscriber = fn;
  },
  publish: (data) => {
    if (pubSub.susbscriber) {
      pubSub.susbscriber(data);
    }
  },
};

run(async (receiveData) => {
  const x = receiveData().then(console.log);
  pubSub.publish(1);
  const y = receiveData().then(console.log);
  pubSub.publish("abort");
});
