<template>
    <v-container fluid>
      <v-row align="center" justify="center">
        <button v-if="user" @click="logout">Logout</button>
        <v-col v-if="user" class="text-h5">{{ user.username }}</v-col>
        <v-col v-else>
          <span class="text-h5">Not logged in.</span>
          
        </v-col> 
  
    
        <v-btn
          href="http://localhost:3001/auth/discord/login" 
          color="indigo"
          class="mt-4"
        >
          <discord-icon class="mr-4"></discord-icon>
          <span>Sign in with Discord</span>
        </v-btn>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        user: null,
      };
    },
    methods: {
      async getMe() {
        try {
          const response = await axios.get('http://localhost:3001/user/me', {
            withCredentials: true,
          });
  
          this.user = response.data;
        } catch (error) {
          console.error('Error:', error.message);
        }
      },

      async logout() {
      try {
        await axios.get('http://localhost:3001/auth/logout', {
          withCredentials: true,
        });

        // Nach erfolgreichem Logout, setze den Benutzer auf null
        this.user = null;
      } catch (error) {
        console.error('Error:', error.message);
      }
    },

    },
    mounted() {
      this.getMe();
    },
  };
  </script>
  
  <style scoped>
  .discord-icon {
    width: 1em;
    height: 1em;
    fill: white;
    margin-right: 0.5em;
    transition: fill 0.3s;
  }
  
  .discord-icon:hover {
    fill: rgba(255, 255, 255, 0.8);
  }
  </style>
  