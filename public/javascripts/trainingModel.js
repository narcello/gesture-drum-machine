const tf = require("@tensorflow/tfjs");
const trainingSet = require("./training");
const testSet = require("./testing");
require("@tensorflow/tfjs-node");

let trainingData, outputData, model;
let training = true;
// let predictButton = document.getElementsByClassName("predict")[0];

const init = async () => {
  splitData();
  createModel();
  console.log("training...");
  await trainData();
  console.log("training finish.");

  console.log("saving...");
  await model.save("file://./my-model");
  console.log("Done!!!");
};

const splitData = () => {
  trainingData = tf.tensor2d(
    trainingSet.map(item => [item.top_left, item.top_right, item.bottom_left, item.bottom_right]),
    [160, 4]
  );

  testingData = tf.tensor2d(
    testSet.map(item => [item.top_left, item.top_right, item.bottom_left, item.bottom_right]),
    [20, 4]
  );

  outputData = tf.tensor2d(
    trainingSet.map(item => [
      item.sound === "hihat" ? 1 : 0,
      item.sound === "ride" ? 1 : 0,
      item.sound === "snare" ? 1 : 0,
      item.sound === "boom" ? 1 : 0
    ]),
    [160, 4]
  );
};

const createModel = () => {
  model = tf.sequential();
  model.add(tf.layers.dense({inputShape: 4, activation: "sigmoid", units: 10}));

  model.add(
    tf.layers.dense({
      inputShape: 10,
      units: 4,
      activation: "softmax"
    })
  );

  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: tf.train.adam()
  });
};

const trainData = async () => {
  let numSteps = 15;
  for (let i = 0; i < numSteps; i++) {
    await model.fit(trainingData, outputData, {epochs: 40});
  }
};

const predict = async inputData => {
  for (let [key, value] of Object.entries(inputData)) {
    inputData[key] = parseFloat(value);
  }
  inputData = [inputData];

  let newDataTensor = tf.tensor2d(
    inputData.map(item => [item.top_left, item.top_right, item.bottom_left, item.bottom_right]),
    [1, 4]
  );

  let prediction = model.predict(newDataTensor);
};

// const displayPrediction = prediction => {
//   let predictionDiv = document.getElementsByClassName("prediction")[0];
//   let predictionSection = document.getElementsByClassName("prediction-block")[0];

//   let maxProbability = Math.max(...prediction.dataSync());
//   let predictionIndex = prediction.dataSync().indexOf(maxProbability);
//   let irisPrediction;

//   switch (predictionIndex) {
//     case 0:
//       irisPrediction = "Setosa";
//       break;
//     case 1:
//       irisPrediction = "Virginica";
//       break;
//     case 2:
//       irisPrediction = "Versicolor";
//       break;
//     default:
//       irisPrediction = "";
//       break;
//   }
//   predictionDiv.innerHTML = irisPrediction;
//   predictionSection.style.display = "block";
// };

init();
