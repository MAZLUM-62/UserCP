<template>
  <v-app>
    <v-container v-if="!user">
      <div class="background-image">

        <img class="background-image-side" src="/src/Assets/Images/3dbackground.gif" alt="Background Image" />

        <div class="discord-login-container">
          <img class="discord-logo-login" src="/src/Assets/Images/logo.png" alt="Logo" />
          <h1>Anmeldung</h1>
          <div class="discord-login-container-text">
            <p class="discord-login-text">
              Du kannst dich mit Discord anmelden. Solltest du keinen Account haben, hast du nach der Anmeldung die
              Möglichkeit einen zu erstellen
            </p>
          </div>
          <v-btn href="http://localhost:3001/auth/discord/login" class="discord-button">
            <span>Mit Discord anmelden</span>
          </v-btn>
        </div>
      </div>
    </v-container>


    <v-app v-if="user">
      <v-navigation-drawer v-model="drawer" color="#171717" v-if="user">
        <v-banner align="center">
          <v-list-item-content class="drawer-title">Central-V</v-list-item-content>
          <v-avatar image="../src/assets/Images/logo.png"></v-avatar>
        </v-banner>

        <v-divider></v-divider>
        <v-list-item icon="mdi-view-dashboard" link title="Dashboard" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-ticket-account" link title="Meine Tickets" to="/Tickets"></v-list-item>
        <v-list-item prepend-icon="mdi-keyboard" link title="Tastaturbelegung" to="/Tastatur"></v-list-item>
        <v-list-item prepend-icon="mdi-file-multiple" link title="Regeln" to="/Regeln"></v-list-item>
        <v-list-item prepend-icon="mdi-account-alert-outline" link title="Whitelist" to="/Whitelist"></v-list-item>
      </v-navigation-drawer>

      <v-app-bar color="#171717" v-if="user">
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title>User Control Panel</v-app-bar-title>

        <v-row class="UserButton" align="center">

          <v-col class="UserButtonBox" v-if="user">

            <v-menu transition="slide-y-transition">
              <template v-slot:activator="{ props }">
                <v-btn class="UserButtonBoxBorder" elevation="16" v-bind="props">
                  <v-col class="username">{{ user.username }}</v-col>

                  <v-avatar color="secondary" v-if="user" :color="getColorFromDiscord(user)" class="discord-avatar">
                    <img :src="getDiscordAvatarUrl(user)" alt="Discord Avatar" width="40" height="40" />
                  </v-avatar>

                  <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="logout">
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
                <v-list-item to="/user">
                  <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-app-bar>

      <v-main>
        <router-view></router-view>
      </v-main>
    </v-app>
  </v-app>
</template>

<style scoped>
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.discord-login-container-text {
  padding: 15px;
  max-width: 400px;
}

.discord-logo-login {
  max-width: 155px;
  max-height: 155px;
  margin: 25px;
  border-radius: 488px;
  background: rgba(65, 5, 83, 0.131) 50% / cover no-repeat;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.644);
}

.background-image-side {
  filter: blur(2px);
}

.discord-button {
  margin: 25px;
  border-radius: 54px;
  color: white;
  background: #7400c2d0;
  backdrop-filter: blur(185.9142608642578px);
}

.background-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discord-login-container {
  max-width: 600px;
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  border-radius: 79.678px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(185.9142608642578px);
}

.UserButton {
  display: flex;
  flex-wrap: wrap;
  flex: 0;
  margin: 0;
}

.v-banner {
  background-color: transparent;
  color: white;
}

.drawer-title {
  font-size: 28px;
  padding: 10px;
}

.UserButtonBox {
  background: #262626;
}

.v-menu>.v-overlay__content>.v-card,
.v-menu>.v-overlay__content>.v-sheet,
.v-menu>.v-overlay__content>.v-list {
  background: #262626;
  color: white;
}

.v-btn.UserButtonBoxBorder {
  height: calc(var(--v-btn-height) + 15px) !important;
}


.discord-avatar img {
  border-radius: 50%;
}

.username-row {
  margin-left: 8px;
}

.username {
  color: white;
  margin-right: 8px;
}
</style>

<script setup>
import { ref } from 'vue'

const drawer = ref(null)
</script>

<script>
import axios from 'axios';

export default {
  data: () => ({
    drawer: false,
    user: null
  }),
  methods: {
    async getMe() {
      try {
        const response = await axios.get('http://localhost:3001/user/me', {
          withCredentials: true,
        });

        this.user = response.data;
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        // Add more detailed error handling as needed
      }
      setInterval(() => {
        location.reload(); // Hier wird die Seite alle 5 Minuten neu geladen
      }, 299950);
    },

    async logout() {
      try {
        await axios.get('http://localhost:3001/auth/logout', {
          withCredentials: true,
        });

        this.user = null;
      } catch (error) {
        console.error('Error:', error.message);
      }
    },

    getDiscordAvatarUrl(user) {
      if (user.avatar) {
        const avatarHash = user.avatar;
        return `https://cdn.discordapp.com/avatars/${user.discord_id}/${avatarHash}.png`;
      } else {
        // If avatar is null, return the default avatar URL
        return 'https://cdn.discordapp.com/embed/avatars/0.png';
      }
    }

  },
  mounted() {
    this.getMe();
    setInterval(() => {
      this.getMe();
      console.log('User data refreshed');
    }, 1 * 10 * 1000); // 5 Minuten in Millisekunden umgerechnet
  },
};
</script>
