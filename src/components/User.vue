<template>
  <v-app style="background-color: #262626;" v-if="user">
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="15" sm="5" md="5">
          <v-card class="v-card-design" dark align="center" justify="center">
            <v-card-text>
              <h1 class="username">{{ user.username }}</h1>
              <v-img :width="200" aspect-ratio="1/1" cover :src="getDiscordAvatarUrl(user)"></v-img>
            </v-card-text>
            <h3>Mitglied seit: {{ formatJoinDate(user.created_at) }}</h3>
            <h3>Spielstunden: {{ user.global_playtime }} </h3>
            <h3>Status: {{ user.user_status }}</h3>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>



<script setup>
import axios from 'axios';
</script>

<script>
export default {

  data: () => ({
    user: null,
  }),

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

    getDiscordAvatarUrl(user) {
      if (user.avatar) {
        const avatarHash = user.avatar;
        return `https://cdn.discordapp.com/avatars/${user.discord_id}/${avatarHash}.png`;
      } else {
        // If avatar is null, return the default avatar URL
        return 'https://cdn.discordapp.com/embed/avatars/0.png';
      }
    },

     formatJoinDate(dateString) {
      const joinDate = new Date(dateString);
      return joinDate.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    },
  },
  mounted() {
    this.getMe();

  },
};

</script>

<style scoped>
.v-card-design {
  margin: 20px;
  max-width: 600px;
  color: white;
  background: transparent;
}


.username {
  color: white;
  /* Set the text color to white */
  margin-bottom: 16px;
  /* Add some bottom margin for spacing */
}
</style>