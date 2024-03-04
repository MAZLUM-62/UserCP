<template>
  <v-app style="background-color: #262626;">
    <v-container>
      <v-img
        :src="imagePath"
        @click="openDialog"
      ></v-img>

      <v-dialog v-model="dialog" max-width="70%">
        <v-card>
          <v-img
            :src="imagePath"
            contain
          ></v-img>
          <v-btn icon @click="closeDialog" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      imagePath: '/src/assets/Images/tastaturbelegung.png',
      dialog: false
    };
  },
  methods: {
    openDialog() {
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  /* Optional: Set the background color of the overlay */
  .v-overlay {
    background-color: rgba(0, 0, 0, 0.8);
  }
</style>
