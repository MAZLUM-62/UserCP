<template>
  <div class="container">
    <h1 class="title">CENTRAL - V</h1>
  </div>
</template>

<style>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-image: url('../assets/Images/trailer2.gif');
  background-size: cover;
  background-position: center;
}

.container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Adjust the opacity here */
}

.title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  text-align: center;
}
</style>
