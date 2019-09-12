let a = [];
let limit = 40
for (let i = 1; i <= limit; i++) {
  rand = Math.random();
  console.log({rand});
  diff = (limit - i).toString();
  console.log({diff});
  magicNumber = diff.length > 1 ? parseInt(diff[0]) + 1 : 1;
  console.log({magicNumber});

  main = Math.abs((rand * magicNumber) / 10 - 1);
  console.log({main});
  second = main * 0.1;
  third = main * 0.2;
  fourth = main * 0.3;

  a.push({
    "top-left": main,
    "top-right": second,
    "bottom-left": third,
    "bottom-right": fourth,
    sound: "hihat"
  });
}
console.log(a);
