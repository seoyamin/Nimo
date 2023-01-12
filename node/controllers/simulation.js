const {getStorage, ref, getDownloadURL, listAll} = require('firebase/storage')
const express = require("express");
const {User, History, Voice, Msg, Sns, SimulData} = require("../models");
var Sequelize = require("sequelize");
const {json, HasMany} = require("sequelize");
const {async} = require('@firebase/util');

const simulation = {
  randomApp: async function (req, res, next) {
    try {
      const user = await User.findOne({where: {id: req.user_id}});
      var arr = [ "sns", "msg", "voice" ];
      let check = [];
      const red = []
      for (t of [ "sns", "msg", "voice" ]) {
        const calc = await SimulData.count({where: {type: t}}) - await History.count({where: {type: t, user_nickname: user.nickname}})
        if (calc > 0) {
          red.push(t)
        }
      }

      while (true) {
        var rand = Math.floor(Math.random() * 3)
        var type = arr[ rand ];

        const doneNum = await History.findAll({
          where: {
            user_nickname: user.nickname,
            type: type,
          },
          attributes: [ "simulNum" ],
          raw: true,
        });

        const done = doneNum.map((x) => Number(x.simulNum));
        console.log(done)
        if (type == "voice") {
          var notDone = await Voice.findAll({
            limit: 1,
            where: {
              num: {[ Sequelize.Op.notIn ]: done},
            },
            attributes: [ "num" ],
            raw: true,
          });
        } else if (type == "msg") {
          var notDone = await Msg.findAll({
            limit: 1,
            where: {
              num: {[ Sequelize.Op.notIn ]: done},
            },
            attributes: [ "num" ],
            raw: true,
          });
        } else if (type == "sns") {
          var notDone = await Sns.findAll({
            limit: 1,
            where: {
              num: {[ Sequelize.Op.notIn ]: done},
            },
            attributes: [ "num" ],
            raw: true,
          });
        }

        if (notDone.length !== 0) {
          console.log("not zero")
          var num = notDone[ 0 ].num;
          break;
        } else {
          console.log("not")
          console.log(type)
          check[ rand ] = true
        }

        if (check[ 0 ] && check[ 1 ] && check[ 2 ]) {
          return res.status(200).json({red})
        }
      }
      return res.status(200).json({type, num, red});
    } catch (error) {
      return res.status(400)
    }
  },
  voiceDoneList: async function (req, res, next) {
    try {
      const user = await User.findOne({where: {id: req.user_id}});

      const simul = await SimulData.findAll({
        where: {
          type: "voice",
        },
        attributes: [ "simulNum", "title", "commentary" ],
        raw: true,
      });

      const history = await History.findAll({
        where: {
          user_nickname: user.nickname,
          type: "voice",
        },
        attributes: [ "simulNum" ],
        raw: true,
      });
      const done = history.map((x) => Number(x.simulNum));

      const data = {
        simul: simul,
        done: done,
      };

      for (const i of simul) {
        if (done.includes(i.simulNum)) {
          i[ 'done' ] = 'true'
        } else {
          i[ 'done' ] = 'false'
        }
      }
      return res.status(200).json(simul);

    } catch (error) {
      return res.status(400)
    }
  },
  voiceSimul: async function (req, res, next) {
    try {
      const scripts = await Voice.findAll({
        where: {
          num: req.params.num,
        },
        attributes: [ "contents", "response" ],
        raw: true,
      });

      const comm = await SimulData.findOne({
        where: {
          type: "voice",
          simulNum: req.params.num,
        },
        attributes: [ "commentary" ],
        raw: true,
      });


      // Firebase Storage
      const storage = getStorage();
      const voiceRef = ref(storage, 'voice/' + String(req.params.num));
      let urlList = [];

      await listAll(voiceRef).then((response) => {
        response.items.forEach((itemRef) => {
          getDownloadURL(itemRef).then((url) => {
            urlList.push(String(url))

            if (urlList.length == (response.items).length) {
              urlList.sort()
              console.log(urlList)

              const scrp = [];

              for (let i = 0; i < scripts.length; i++) {
                let item;
                if (i < urlList.length) {
                  item = {
                    contents: scripts[ i ].contents,
                    response: parseInt(scripts[ i ].response),
                    url: urlList[ i ]
                  }
                }
                else {
                  item = {
                    contents: scripts[ i ].contents,
                    response: parseInt(scripts[ i ].response),
                    url: ''
                  }
                }

                scrp.push(item)
              }

              const data = {
                scripts: scrp,
                commentary: String(Object.values(comm))
              };

              return res.status(200).json(data);

            }
          })
        })
      }).catch((e) => {
        return res.status(400);
      });

    } catch (error) {
      return res.status(400);
    }
  },
  msgDoneList: async function (req, res, next) {
    try {
      const user = await User.findOne({where: {id: req.user_id}});
      const simul = await SimulData.findAll({
        where: {
          type: "msg",
        },
        attributes: [ "simulNum", "title", "commentary" ],
        raw: true,
      });
      const history = await History.findAll({
        where: {
          user_nickname: user.nickname,
          type: "msg",
        },
        attributes: [ "simulNum" ],
        raw: true,
      });
      const done = history.map((x) => Number(x.simulNum));

      for (const i of simul) {
        if (done.includes(i.simulNum)) {
          i[ 'done' ] = 'true'
        } else {
          i[ 'done' ] = 'false'
        }
      }
      return res.status(200).json(simul);
    } catch (error) {
      return res.status(500);
    }
  },
  msgSimul: async function (req, res, next) {
    try {
      const scripts = await Msg.findAll({
        where: {
          num: req.params.num,
        },
        attributes: [ "contents", "response" ],
        raw: true,
      });
      const scrp = [];
      scripts.map((x) => {
        scrp.push([ x.contents, parseInt(x.response) ]);
      });

      const comm = await SimulData.findOne({
        where: {
          type: "msg",
          simulNum: req.params.num,
        },
        attributes: [ "commentary" ],
        raw: true,
      });

      const data = {
        scripts: scrp,
        commentary: String(Object.values(comm)),
      };

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500);
    }
  },
  snsDoneList: async function (req, res, next) {
    try {
      const user = await User.findOne({where: {id: req.user_id}});
      const simul = await SimulData.findAll({
        where: {
          type: "sns",
        },
        attributes: [ "simulNum", "title", "commentary" ],
        raw: true,
      });
      const history = await History.findAll({
        where: {
          user_nickname: user.nickname,
          type: "sns",
        },
        attributes: [ "simulNum" ],
        raw: true,
      });
      const done = history.map((x) => Number(x.simulNum));

      for (const i of simul) {
        if (done.includes(i.simulNum)) {
          i[ 'done' ] = 'true'
        } else {
          i[ 'done' ] = 'false'
        }
      }
      return res.status(200).json(simul);
    } catch (error) {
      return res.status(500);
    }
  },
  snsSimul: async function (req, res, next) {
    try {
      const scripts = await Sns.findAll({
        where: {
          num: req.params.num,
        },
        attributes: [ "contents", "response" ],
        raw: true,
      });
      const scrp = [];
      scripts.map((x) => {
        scrp.push([ x.contents, parseInt(x.response) ]);
      });

      const comm = await SimulData.findOne({
        where: {
          type: "sns",
          simulNum: req.params.num,
        },
        attributes: [ "commentary" ],
        raw: true,
      });

      const data = {
        scripts: scrp,
        commentary: String(Object.values(comm)),
      };

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500);
    }
  },
  addDoneList: async function (req, res, next) {
    try {
      const {type, simulNum} = req.body;
      const user = await User.findOne({where: {id: req.user_id}});

      const [ history, created ] = await History.findOrCreate({
        where: {
          user_nickname: user.nickname,
          type: type,
          simulNum: simulNum
        }
      })

      if (created) {
        console.log("if")
        return res.status(200).json({message: "simulation done"})
      } else {
        console.log("else")
        return res.status(201).json({message: "already done"})
      }
    } catch (error) {
      return res.status(400).json(error);
    }
  },
  showHistory: async function (req, res, next) {
    try {
      const user = await User.findOne({where: {id: req.user_id}});
      const history = await History.findAll({
        where: {
          user_nickname: user.nickname,
        },
        attributes: [ "type", "simulNum" ],
        raw: true,
      });
      return res.status(200).json(history);
    } catch (error) {
      return res.status(500);
    }
  }
}
module.exports = simulation;