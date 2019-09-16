import React from "react"
import Layout from "../components/layout"
import {App} from "../utils/withPreModel"

new App()
const IndexPage = () => (
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

      <video autoplay id="webcam"></video>

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

export default IndexPage
