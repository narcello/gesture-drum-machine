// Number of classes to classify
const NUM_CLASSES = 4;
// Webcam Image size. Must be 227.
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

const classes = ["hihat", "ride", "snare", "boom"];
let testPrediction = false;
let training = true;
let video = document.getElementById("webcam");

class App {
  constructor() {
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.recordSamples = false;

    // Initiate deeplearn.js math and knn classifier objects
    this.loadClassifierAndModel();
    this.initiateWebcam();
    this.setupButtonEvents();
  }

  async loadClassifierAndModel() {
    this.knn = knnClassifier.create();
    this.mobilenetModule = await mobilenet.load();
    console.log("model loaded");

    this.start();
  }

  initiateWebcam() {
    // Setup webcam
    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(stream => {
      video.srcObject = stream;
      video.width = IMAGE_SIZE;
      video.height = IMAGE_SIZE;
    });
  }

  setupButtonEvents() {
    for (let i = 0; i < NUM_CLASSES; i++) {
      let button = document.getElementsByClassName("button")[i];

      button.onmousedown = () => {
        this.training = i;
        this.recordSamples = true;
      };
      button.onmouseup = () => (this.training = -1);

      const infoText = document.getElementsByClassName("info-text")[i];
      infoText.innerText = "0";
      this.infoTexts.push(infoText);
    }
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.timer);
  }

  async animate() {
    if (this.recordSamples) {
      // Get image data from video element
      const image = tf.browser.fromPixels(video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenetModule.infer(image, "conv_preds");

      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();

        // Add current image to classifier
        this.knn.addExample(logits, this.training);
      }

      const numClasses = this.knn.getNumClasses();

      if (testPrediction) {
        training = false;
        if (numClasses > 0) {
          // If classes have been added run predict
          logits = infer();
          const {classIndex} = await this.knn.predictClass(logits, TOPK);

          playDrum(classes[classIndex]);

          for (let i = 0; i < NUM_CLASSES; i++) {
            // The number of examples for each class
            const exampleCount = this.knn.getClassExampleCount();

            // Make the predicted class bold
            if (classIndex == i) {
              this.infoTexts[i].style.fontWeight = "bold";
            } else {
              this.infoTexts[i].style.fontWeight = "normal";
            }

            // if (exampleCount[i] > 0) {
            //   this.infoTexts[i].innerText = ` ${exampleCount[i]} - ${res.confidences[i] * 100}%`;
            // }
          }
        }
      }

      if (training) {
        // The number of examples for each class
        const exampleCount = this.knn.getClassExampleCount();

        for (let i = 0; i < NUM_CLASSES; i++) {
          if (exampleCount[i] > 0) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} examples`;
          }
        }
      }

      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}

document.getElementsByClassName("test-predictions")[0].addEventListener("click", function() {
  testPrediction = true;
});

new App();

function playDrum(piece) {
  var audio = new Audio(`./sounds/${piece}.wav`);
  audio.play();
}
