const express = require('express');
const app = express();

// const db = require('./models'); 라 써도 똑같음(어짜피 index.js 파일 먼저 실행하니까)
const db = require('./models/index');
const { Member } = db;

// 서버로부터 온 request의 body에 json 데이터가 있을 때 이를 추출해서 request 객체의 body 프로퍼티에 할당해주는 전처리(=Middleware).
app.use(express.json());

app.get('/api/members', async (req, res) => {
  const { team } = req.query;
  if (team) {
    const teamMembers = await Member.findAll({ 
      where: {team: team},
      order: [['admissionDate', 'DESC']]
    });
    res.send(teamMembers);
  } else {
    const members = await Member.findAll({
      order: [['admissionDate', 'DESC']]
    });
    res.send(members);
  }
});

app.get('/api/members/:id', async (req, res) => {
  //(아래 코드와 같음) const id = req.params.id; 
  const { id } = req.params;
  // 라우터 파라미터로 넘어오는 id 값은 string으로 넘어오기 때문에 Number로 변환해주어야 함.
  const member = await Member.findOne({ where: { id: id } }); 
  if (member) {
    res.send(member);
  } else {
    res.status(404).send({ message: 'There is no such member!' });
  }
});

app.post('api/members', async (req, res) => {
  const newMember = req.body;
  const member = Member.build(newMember);
  await member.save();
  res.send(member);
})

app.put('api/members/:id', async (req, res) => {
  const { id } = req.params;
  const newInfo = req.body;
  const result = await Member.update(newInfo, { where: { id } });
  if (result[0]) {
    res.send({ message: `${result[0]} row(s) affected`});
  } else {
    res.status(404).send({ message: 'There is no member with the id!'});
  }
});

// add.put('api/members/:id', (req, res) => {
//   const { id } = req.params;
//   const newInfo = req.body;
//   // 아래에서 member는 테이블과 연동되어 있기 때문에, 이 member의 프로퍼티를 변경하고 저장만 해줘도 db가 수정됨(ORM의 핵심).
//   const member = Member.findOne({ where: { id: id }});
//   if (member) {
//     Object.keys(newInfo).forEach((prop) => {
//     member[prop] = newInfo[prop];
//     });
//     await member.save();
//     res.send(member); 
//   } else {
//     res.status(404).send({ message: 'There is no member with the id!' });
//   }
// });

app.delete('api/members/:id', async (req, res) => {
  const { id } = req.params;
  const deletedCount = await Member.destroy({ where: { id: id } });
  if (deletedCount) {
    res.send({ message: `${deletedCount} row(s) deleted` });
  } else {
    res.status(404).send({ message: 'There is no member with the id!' });
  }
});

app.listen(3000, () => {
  console.log("Server is listening...");
});