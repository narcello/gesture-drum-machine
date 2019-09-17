import React, {useState, useEffect} from "react"
import Layout from "../components/layout"
// import {App} from "../utils/withPreModel"
// import {modelFromJSON} from "@tensorflow/tfjs-layers/dist/models"
import {KNNClassifier} from "@tensorflow-models/knn-classifier"
import * as MobileNet from "@tensorflow-models/mobilenet"
import * as tf from "@tensorflow/tfjs"
// import myModel from "../my-model/model.json"
// import {init} from "xstate/lib/actionTypes"

const Video = () => <video autoplay id="webcam"></video>

const IndexPage = () => {
  const [training, setTraining] = useState(-1)
  const [recordSamples, setRecordSamples] = useState(false)
  const [knn, setKnn] = useState()
  const [mobilenetModule, setMobilenetModule] = useState()
  const [timer, setTimer] = useState()
  // Number of classes to classify
  const NUM_CLASSES = 4
  // Webcam Image size. Must be 227.
  const IMAGE_SIZE = 227
  // K value for KNN
  const TOPK = 10

  const classes = ["hihat", "ride", "snare", "boom"]
  let testPrediction = false

  navigator.mediaDevices
    .getUserMedia({video: true, audio: false})
    .then(stream => {
      Video.srcObject = stream
      Video.width = IMAGE_SIZE
      Video.height = IMAGE_SIZE
    })

  useEffect(() => {
    init()
    start()
  }, [])

  const init = async () => {
    setupButtonEvents()
    initiateWebcam()
    await loadClassifierAndModel()
  }

  const loadClassifierAndModel = async () => {
    setKnn(KNNClassifier.create())
    setMobilenetModule(await MobileNet.load())
    // this.myModel = await modelFromJSON(myModel)
  }

  const initiateWebcam = () => {
    // Setup webcam
    // let video = document.getElementById("webcam")
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    // .then(stream => {
    //   video.srcObject = stream
    //   video.width = IMAGE_SIZE
    //   video.height = IMAGE_SIZE
    // })
  }

  const setupButtonEvents = () => {
    for (let i = 0; i < NUM_CLASSES; i++) {
      let button = document.getElementsByClassName("button")[i]

      button.onmousedown = () => {
        setTraining(i)
        setRecordSamples(true)
      }
      button.onmouseup = () => setTraining(-1)
    }
  }

  const start = () => {
    if (timer) {
      stop()
    }
    setTimer(requestAnimationFrame(animate.bind(this)))
  }

  const stop = () => {
    cancelAnimationFrame(timer)
  }

  const animate = async () => {
    if (recordSamples) {
      // Get image data from video element
      const image = tf.browser.fromPixels(Video)

      let logits
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => mobilenetModule.infer(image, "conv_preds")

      // Train class if one of the buttons is held down
      if (training !== -1) {
        logits = infer()

        // Add current image to classifier
        knn.addExample(logits, training)
      }

      const numClasses = knn.getNumClasses()

      if (testPrediction) {
        training = false
        if (numClasses > 0) {
          // If classes have been added run predict
          logits = infer()
          // const res = await  myModel.predict(logits, TOPK)
          const {classIndex} = await knn.predictClass(logits, TOPK)

          playDrum(classes[classIndex])
        }
      }

      // Dispose image when done
      image.dispose()
      if (logits != null) {
        logits.dispose()
      }
    }
    timer = requestAnimationFrame(this.animate.bind(this))
  }

  return (
    <Layout>
      <main class="content">
        <section class="button-section top-left">
          <button class="button">Hihat</button>
          <div class="examples-text">
            <span class="info-text"></span>
          </div>
        </section>

        <section class="button-section top-right">
          <button class="button">Ride</button>
          <div class="examples-text">
            <span class="info-text"></span>
          </div>
        </section>

        <Video />

        <section class="button-section bottom-left">
          <button class="button">Snare</button>
          <div class="examples-text">
            <span class="info-text"></span>
          </div>
        </section>

        <section class="button-section bottom-right">
          <button class="button">Boom</button>
          <div class="examples-text">
            <span class="info-text"></span>
          </div>
        </section>

        <section class="button-section test">
          <button class="button test-predictions predict">
            Test predictions
          </button>
        </section>
      </main>
    </Layout>
  )
}

export default IndexPage

function playDrum(sound) {
  var audio = new Audio(`./sounds/${sound}.wav`)
  audio.play()
}
