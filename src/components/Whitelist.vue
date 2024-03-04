<template>
  <v-app style="background-color: #262626;">
    <v-container>
      <v-card>
        <v-card-title class="headline">
          Whitelist
        </v-card-title>
        <v-card-text>
          <c-card-text>
            <template v-if="user && user.whitelist_status">
              Du hast die Whitelist bereits bestanden.
            </template>
            <template v-else>
              Um auf unserem Server spielen zu können, musst du dich zuerst whitelisten.
              Dazu musst du 10 Fragen beantworten, um zu zeigen, dass du die Regeln gelesen hast.
              Du hast nur einen Versuch pro Tag.
              Wenn du auf "Whitelist Starten" drückst, wird der Versuch gestartet.
              Lade die Seite nicht neu, denn das gilt als Versuch.
              Wenn du alle Fragen beantwortet hast, drücke auf "Antworten überprüfen".
            </template>
          </c-card-text>

          <v-btn @click="startWhitelist" color="purple" :disabled="whitelistStarted"> Whitelist {{ whitelistStarted ?
            'gestartet' : 'starten' }}</v-btn>
          <v-list v-if="questions.length > 0 && whitelistStarted">
            <v-list-item-group v-model="selectedAnswers">
              <v-list-item v-for="(question, index) in questions" :key="index">
                <v-list-item-content>
                  <v-list-item-title class="title">{{ question.question }}</v-list-item-title>
                  <v-radio-group v-model="selectedAnswers[index]" :mandatory="true">
                    <v-row>
                      <v-col v-for="(option, optionIndex) in question.options" :key="optionIndex" cols="12">
                        <v-radio :label="option" :value="option"></v-radio>
                      </v-col>
                    </v-row>
                  </v-radio-group>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
            <v-btn @click="submitAnswers" color="purple" v-if="whitelistStarted">Antworten
              überprüfen</v-btn>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right>
      {{ snackbar.message }}
      <v-btn @click="snackbar.show = false">Schließen</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: null,
      questions: [],
      selectedAnswers: [],
      snackbar: {
        show: false,
        message: '',
        color: '',
      },
      whitelistStarted: false,
    };
  },
  methods: {
    async getMe() {
      try {
        const response = await axios.get('http://localhost:3001/user/me', {
          withCredentials: true,
        });
        this.user = response.data;
        console.log('User information:', this.user_id);
      } catch (error) {
        console.error('Error:', error.message);
      }
    },
    async loadQuestions() {
      try {
        const response = await axios.get('http://localhost:3001/questions/getRandomQuestions');
        this.questions = response.data;
      } catch (error) {
        console.error('Fehler beim Laden der Fragen:', error);
      }
    },
    async submitAnswers() {
      if (this.selectedAnswers.some(answer => !answer)) {
        this.showSnackbar('Bitte beantworte alle Fragen, bevor du fortfährst.', 'error');
        return;
      }

      try {
        const response = await axios.post('http://localhost:3001/questions/checkAnswers', { answers: this.selectedAnswers });
        console.log('Server-Antwort:', response.data);
      } catch (error) {
        console.error('Fehler beim Überprüfen der Antworten:', error);
      }
    },
    async startWhitelist() {
      if (this.whitelistStarted) {
        this.showSnackbar('Du hast die Whitelist bereits gestartet.');
      } else {
        this.whitelistStarted = true;
        await this.loadQuestions();
      }
    },
    showSnackbar(message, color = 'error') {
      this.snackbar.show = true;
      this.snackbar.message = message;
      this.snackbar.color = color;
    },
  },
};
</script> 
