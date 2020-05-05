'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Baby = require('../models/babies');
const User = require('../models/user');
const BreaseFeeding = require('../models/breasefeedings');
const Diper = require('../models/dipers');
//CSRF対策
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});


//ページ表示
//赤ちゃんの新規登録
router.get('/new', authenticationEnsurer, csrfProtection,(req, res, next) => {
  res.render('babynew', { user: req.user , csrfToken: req.csrfToken()});
});

//赤ちゃん情報の編集ページ
router.get('/:babyId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    //作成したユーザのみが編集フォーム表示可能
    if(isMine(req, baby)){
      res.render('babyedit', {
        user: req.user,
        baby: baby,
        csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//授乳登録ページ
router.get('/:babyId/breasefeedings/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    //作成したユーザのみが編集フォーム表示可能
    if(isMine(req, baby)){
      res.render('breasefeedingNew', { 
        user: req.user,
        baby: baby,
        csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または登録権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//授乳の編集ページ
router.get('/:babyId/breasefeedings/:breasefeedingId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    BreaseFeeding.findOne({
      where: {
        breasefeedingId: req.params.breasefeedingId,
        babyId: baby.babyId
      }
    }).then((breasefeeding) => {
      //作成したユーザのみが編集フォーム表示可能
      if(isMine(req, baby)){
        res.render('breasefeedingEdit', {
          user: req.user,
          baby: baby,
          breasefeeding: breasefeeding,
          formatday: getStringDayFromDate(breasefeeding.day),
          time: getStringTimeFromDate(breasefeeding.day),
          csrfToken: req.csrfToken()
        });
      } else {
        const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
        err.status = 404;
        next(err);
      }
    });
  });
});

//オムツ替え登録ページ
router.get('/:babyId/dipers/new', authenticationEnsurer, csrfProtection,(req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    //作成したユーザのみが編集フォーム表示可能
    if(isMine(req, baby)){
      res.render('diperNew', { 
        user: req.user,
        baby: baby,
        csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または登録権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//オムツの編集ページ
router.get('/:babyId/dipers/:diperId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    Diper.findOne({
      where: {
        diperId: req.params.diperId,
        babyId: baby.babyId
      }
    }).then((diper) => {
      //作成したユーザのみが編集フォーム表示可能
      if(isMine(req, baby)){
        res.render('diperEdit', {
          user: req.user,
          baby: baby,
          diper: diper,
          formatday: getStringDayFromDate(diper.day),
          time: getStringTimeFromDate(diper.day),
          csrfToken: req.csrfToken()
        });
      } else {
        const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
        err.status = 404;
        next(err);
      }
    });
  });
});

//赤ちゃんの詳細ページ
router.get('/:babyId', authenticationEnsurer, (req, res, next) => {
  var breasefeedingNext = '';

  Baby.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
      where: {
        babyId: req.params.babyId
      },
      order: [['updatedAt', 'ASC']]
  }).then((baby) => {
    //BabyTable + UserTableより対象のBabyIDのレコードを取得
    if(baby) {
      BreaseFeeding.findAll({
        where: { babyId: baby.babyId },
        order: [['day','DESC']]
      }).then((breasefeedings) => {
        if(breasefeedings.length){

          //連想配列内の日付を出力用にフォーマット
          for(var i = 0; i < breasefeedings.length; i++){
            breasefeedings[i]['formatday'] = getStringFromDate(breasefeedings[i].day);
          }

          var nextTime;
          nextTime = breasefeedings[0].day;
          nextTime.setHours(nextTime.getHours() + baby.interval);
          breasefeedingNext = getStringFromDate(nextTime);
         
        }else{
          breasefeedingNext = '授乳記録がありません。';
        }
        Diper.findAll({
          where: { babyId: baby.babyId },
          order: [['day', 'DESC']]
        }).then((dipers) => {

          //連想配列内の日付を出力用にフォーマット
          if(dipers.length){
            for(var i = 0; i < dipers.length; i++){
              dipers[i]['formatday'] = getStringFromDate(dipers[i].day);
              dipers[i]['formatpeepooType'] = getPeePooType(dipers[i].peepooType);
            }
          }          

          res.render('baby', {
            user: req.user,
            baby: baby,
            breasefeedings: breasefeedings,
            dipers: dipers,
            breasefeedingNext: breasefeedingNext
          });
        });
      });
    }else{
      const err = new Error('指定された赤ちゃん情報は見つかりません');
      err.status = 404;
      next(err);
    }
  });
});


//WebAPI
//DBへ赤ちゃん情報を新規登録
router.post('/', authenticationEnsurer, csrfProtection,(req, res, next) => {
  const babyId = uuid.v4();
  const updateAt = new Date();
  var intervalParam = 3;

  //半角数字+値チェック
  if(isEisu(req.body.interval)){
    if(req.body.interval < 0){
      intervalParam = 0;
    }else if(req.body.interval > 10){
      intervalParam = 10;
    }else{
      intervalParam = req.body.interval;
    }
  }

  Baby.create({
    babyId: babyId,
    babyName: req.body.babyName.slice(0, 255) || '(名前未設定)',
    userId: req.user.id,
    sex: parseInt(req.body.sex, 10),
    interval: intervalParam,
    updateAt: updateAt
  }).then((baby) => {
    res.redirect('/babies/' + baby.babyId);
  });
});

//赤ちゃん情報の更新・削除
router.post('/:babyId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    if(baby && isMine(req, baby)){
      if(parseInt(req.query.edit) === 1) {
        //編集
        const updatedAt = new Date();
        var intervalParam = 3;

        //半角数字+値チェック
        if(isEisu(req.body.interval)){
          if(req.body.interval < 0){
            intervalParam = 0;
          }else if(req.body.interval > 10){
            intervalParam = 10;
          }else{
            intervalParam = req.body.interval;
          }
        }
      
        baby.update({
          babyId: baby.babyId,
          babyName: req.body.babyName.slice(0, 255) || '(名称未設定)',
          userId: req.user.id,
          sex: req.body.sex,
          interval: intervalParam,
          updatedAt: updatedAt
        }).then(() => {
          res.redirect('/');
        });
      } else if(parseInt(req.query.delete) === 1){
        //削除
        deleteBabyAggregate(req.params.babyId, () => {
          res.redirect('/');
        });
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//授乳記録の追加
router.post('/:babyId/breasefeedings/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    if(baby && isMine(req, baby)){
      var day = req.body.date;
      var time = req.body.time;
      var daytime = day + ' ' + time + ':00';
        BreaseFeeding.create({
          day: daytime,
          rightMinutes: parseInt(req.body.rightMinutes),
          leftMinutes: parseInt(req.body.leftMinutes),
          milk: parseInt(req.body.milk),
          memo: req.body.memo,
          babyId: baby.babyId
        }).then(() => {
          res.redirect('/babies/' + baby.babyId);
        });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//授乳情報の更新・削除
router.post('/:babyId/breasefeedings/:breasefeedingId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    if(baby && isMine(req, baby)){
      BreaseFeeding.findOne({
        where: {
          breasefeedingId: req.params.breasefeedingId,
          babyId: baby.babyId
        }
      }).then((breasefeeding) => {
        if(parseInt(req.query.edit) === 1) {
          //編集
  
          var day = req.body.date;
          var time = req.body.time;
          var daytime = day + ' ' + time + ':00';
    
          breasefeeding.update({
            day: daytime,
            rightMinutes: parseInt(req.body.rightMinutes),
            leftMinutes: parseInt(req.body.leftMinutes),
            milk: parseInt(req.body.milk),
            memo: req.body.memo,
            babyId: baby.babyId
          }).then(() => {
             res.redirect('/babies/' + baby.babyId);
          });
        } else if(parseInt(req.query.delete) === 1){
          //削除
          deleteBreaseFeedingAggregate(req.params.breasefeedingId, () => {
            res.redirect('/babies/' + baby.babyId);
          });
        } else {
          const err = new Error('不正なリクエストです');
          err.status = 400;
          next(err);
        }
      });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//オムツ替え記録の追加
router.post('/:babyId/dipers/new', authenticationEnsurer, csrfProtection,(req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    if(baby && isMine(req, baby)){
      var day = req.body.date;
      var time = req.body.time;
      var daytime = day + ' ' + time + ':00';
        Diper.create({
          day: daytime,
          peepooType: parseInt(req.body.peepooType),
          memo: req.body.memo,
          babyId: baby.babyId
        }).then(() => {
          res.redirect('/babies/' + baby.babyId);
        });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//オムツ情報の更新・削除
router.post('/:babyId/dipers/:diperId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Baby.findOne({
    where: {
      babyId: req.params.babyId
    }
  }).then((baby) => {
    if(baby && isMine(req, baby)){
      Diper.findOne({
        where: {
          diperId: req.params.diperId,
          babyId: baby.babyId
        }
      }).then((diper) => {
        if(parseInt(req.query.edit) === 1) {
          //編集
  
          var day = req.body.date;
          var time = req.body.time;
          var daytime = day + ' ' + time + ':00';
    
          diper.update({
            day: daytime,
            peepooType: parseInt(req.body.peepooType),
            memo: req.body.memo,
            babyId: baby.babyId
          }).then(() => {
             res.redirect('/babies/' + baby.babyId);
          });
        } else if(parseInt(req.query.delete) === 1){
          //削除
          deleteDiperAggregate(req.params.diperId, () => {
            res.redirect('/babies/' + baby.babyId);
          });
        } else {
          const err = new Error('不正なリクエストです');
          err.status = 400;
          next(err);
        }
      });
    } else {
      const err = new Error('指定された赤ちゃん情報がない、または編集権限がありません.');
      err.status = 404;
      next(err);
    }
  });
});

//Local Method
function isMine(req, baby){
  return baby && parseInt(baby.userId) === parseInt(req.user.id);
}

function deleteBabyAggregate(babyId, done, err){
  //従属の授乳記録の削除
  const promiseBreaseFeedingDestroy = BreaseFeeding.findAll({
    where: { babyId: babyId }
  }).then((breasefeedings) => {
    return Promise.all(breasefeedings.map((b) => { return b.destroy(); }));    
  });

  //従属のオムツ記録の削除
  Diper.findAll({
    where: { babyId: babyId }
  }).then((dipers) => {
    const promises = dipers.map((d) => { return d.destroy(); });
    promises.push(promiseBreaseFeedingDestroy);
    return Promise.all(promises);
  }).then(() => {
    //プライマリーキーから対象を削除
    return Baby.findByPk(babyId).then((b) => {return b.destroy(); });
  }).then(() => {
    if(err) return done(err);
    done();
  });
}

function deleteBreaseFeedingAggregate(breasefeedingId, done, err){
  //プライマリーキーから対象を削除
  BreaseFeeding.findByPk(breasefeedingId).then((b) => {
    return b.destroy(); 
  }).then(() => {
    if(err) return done(err);
    done();
  });
}

function deleteDiperAggregate(diperId, done, err){
  Diper.findByPk(diperId).then((d) => {
    return d.destroy(); 
  }).then(() => {
    if(err) return done(err);
    done();
  });  
}

function isEisu(str){
  str = (str==null)?"":str;
  if(str.match(/^[0-9]*$/)){
    return true;
  }else{
    return false;
  }
}

//日付から文字列に変換する関数
function getStringFromDate(date) {
 
  var year_str = date.getFullYear();
  //月だけ+1すること
  var month_str = 1 + date.getMonth();
  var day_str = date.getDate();
  var hour_str = date.getHours();
  var minute_str = date.getMinutes();
  var second_str = date.getSeconds();
  
  
  var format_str = 'YYYY/MM/DD hh:mm:ss';
  format_str = format_str.replace(/YYYY/g, year_str);
  format_str = format_str.replace(/MM/g, month_str);
  format_str = format_str.replace(/DD/g, day_str);
  format_str = format_str.replace(/hh/g, hour_str);
  format_str = format_str.replace(/mm/g, minute_str);
  format_str = format_str.replace(/ss/g, second_str);
  
  return format_str;
 };

 //日時から日付のみを抽出
function getStringDayFromDate(date) {
  var year_str = date.getFullYear();
  //月だけ+1すること
  var month_str = ("0"+(1+date.getMonth())).slice(-2);
  var day_str = ("0"+date.getDate()).slice(-2);

  var format_str = 'YYYY-MM-DD';
  format_str = format_str.replace(/YYYY/g, year_str);
  format_str = format_str.replace(/MM/g, month_str);
  format_str = format_str.replace(/DD/g, day_str);

  return format_str;
}

//日時から時間のみを抽出
function getStringTimeFromDate(date) {
  var hour_str = ("0"+date.getHours()).slice(-2);
  var minute_str = ("0"+date.getMinutes()).slice(-2);

  var format_str = 'hh:mm';
  format_str = format_str.replace(/hh/g, hour_str);
  format_str = format_str.replace(/mm/g, minute_str);

return format_str;
}

//オムツ替え理由を返却
function getPeePooType(peepooType){
  var format_type = '';

  if(peepooType === 0){
    format_type = "おしっこ";
  }else if(peepooType === 1){
    format_type = 'うんち';
  }else if(peepooType === 2){
    format_type = '両方'
  }

  return format_type;
}

module.exports = router;