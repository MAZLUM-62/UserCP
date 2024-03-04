<template>
  <v-app class="ticket-detail-container" style="background-color: #262626;">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="6">
              <h1 class="Ticket-text-color">Ticket Details</h1>
            </v-col>
            <v-col cols="6" class="text-right">
              <v-btn @click="goBack" color="purple">Zurück</v-btn>
            </v-col>
          </v-row>

        </v-col>


      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card class='ticket-info-banenr'>
            <v-card-title>{{ ticket ? ticket.subject : 'Loading...' }}</v-card-title>
            <v-card-subtitle v-if="ticket">Ticket ID: {{ ticket.ticket_id }}</v-card-subtitle>

            <v-card-text>
              <p v-if="ticket"><strong>Kategorie:</strong> {{ ticket.category }}</p>
              <p v-if="ticket"><strong>Erstellt am:</strong> {{ formatDateTime(ticket.created_at) }}</p>
              <p v-if="ticket"><strong>letzter Update:</strong> {{ formatDateTime(ticket.updated_at) }}</p>
              <p v-if="ticket"><strong>Beschreibung:</strong> {{ ticket.description }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Chat Section -->
      <v-row>
        <v-col cols="12">
          <h2 class="Ticket-text-color">Antwort</h2>
          <v-list lines="two" class="ticket-massages">
            <v-list-item class="ticket-massages" v-for="ticketChat in ticketChat" :key="ticketChat.id" two-line>
              <v-list-item-content>
                <v-row v-if="ticketChat.user_id === user_id">
                  <!-- User Nachrichten auf der linken Seite -->
                  <v-col>
                    <div class="message-box user-message-box">
                      <p class="username">{{ user.username }}</p>
                      <v-list-item>{{ ticketChat.message }}</v-list-item>
                      <v-list-item-subtitle>{{ formatDateTime(ticketChat.created_at) }}</v-list-item-subtitle>
                    </div>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <!-- Admin Nachrichten bzw. Support-Antworten auf der rechten Seite -->
                  <v-col class="text-right">
                    <div class="message-box admin-message-box">
                      <p class="username">Admin</p>
                      <v-list-item>{{ ticketChat.message }}</v-list-item>
                      <v-list-item-subtitle>{{ formatDateTime(ticketChat.created_at) }}</v-list-item-subtitle>
                    </div>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <!-- Add a new message -->
          <v-textarea v-if="ticket && ticket.status !== 'Abgeschlossen'" class="Ticket-text-color" variant="outlined"
            v-model="newMessage.description" label="Antworten" outlined :counter="5000"></v-textarea>
          <v-btn v-if="ticket && ticket.status !== 'Abgeschlossen'" @click="addMessage" color="purple">Antworten</v-btn>

        </v-col>
      </v-row>

    </v-container>
  </v-app>
</template>

  
<script>
import axios from 'axios';

export default {
  data() {
    return {
      user_id: null,
      user_status: null,
      ticket: null,
      ticket_username: '',
      ticketChat: [],
      newMessage: {
        description: '',
      }
    };
  },
  methods: {
    async fetchTicketDetails() {
      try {
        const ticketId = this.$route.params.id;
        const response = await axios.get(`http://localhost:3001/api/tickets/${ticketId}`, {
          withCredentials: true,
        });

        console.log('Ticket details:', response.data);
        this.ticket = response.data;
        this.ticket_username = response.data.username;
      } catch (error) {
        console.error('Error fetching ticket details:', error.message);
      }
    },
    goBack() {
      this.$router.push('/tickets');
    },

    async getMe() {
      try {
        const response = await axios.get('http://localhost:3001/user/me', {
          withCredentials: true,
        });
        
        this.user = response.data;
        this.username = response.data.username;
        this.user_id = response.data.user_id;

        console.log('User details:', response.data);
      } catch (error) {
        console.error('Error:', error.message);
      }
    },

    async getMessage() {
      try {
        const ticketId = this.$route.params.id;
        const response = await axios.get(`http://localhost:3001/api/tickets/${ticketId}/getresponses`, {
          withCredentials: true,
        });

        console.log('Antworten Ticket:', response.data);
        this.ticketChat = response.data;
      } catch (error) {
        console.error('Error fetching ticket responses:', error.message);
      }
    },

    async addMessage() {
      try {
        const ticketId = this.$route.params.id;

        if (this.ticket && this.ticket.status === 'Abgeschlossen') {
          console.log('Das Ticket ist bereits abgeschlossen. Sie können keine weiteren Antworten hinzufügen.');
          return;
        }

        await axios.post(`http://localhost:3001/api/tickets/${ticketId}/postresponses`, {
          message: this.newMessage.description,
        }, {
          withCredentials: true,
        });

        // Leere das Eingabefeld für die neue Nachricht
        this.newMessage.description = '';

        // Aktualisiere die Ticketdetails, um den aktualisierten Chat anzuzeigen
        await this.fetchTicketDetails();

        // Rufe getMessage auf, um die neuesten Nachrichten zu erhalten
        await this.getMessage();
      } catch (error) {
        console.error('Error adding message:', error.message);
      }
    },

    getStatusColorClass(status) {
      switch (status) {
        case 'Unbearbeitet':
          console.log('Status: Offen');
          return 'text-red';
        case 'In Bearbeitung':
          console.log('Status: In Bearbeitung');
          return 'text-orange';
        case 'Abgeschlossen':
          console.log('Status: Abgeschlossen');
          return 'text-green';
        case 'Weitergeleitet':
          console.log('Status: Weitergeleitet');
          return 'text-blue';
        default:
          console.log('Unknown status:', status);
          return '';
      }
    },
    formatDateTime(isoDateString) {
      const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'Europe/Berlin', // Set to German time zone
      };

      const formattedDate = new Date(isoDateString).toLocaleDateString('de-DE', options);
      return formattedDate;
    },
  },
  created() {
    console.log('TicketDetail Component mounted');
    console.log('Initial user_id:', this.user_id); // Hinzufügen dieser Zeile
    if (this.$route.params.id) {
      this.fetchTicketDetails();
      this.getMessage();
      this.getMe();
    } else {
      console.error('No ticket ID found in the route parameters.');
    }
  },
};
</script>
<style scoped>
.ticket-massages {
  background-color: transparent;
}

.ticket-info-banenr {
  background-color: transparent;
  color: white;
}

.Ticket-text-color {
  color: white;
}

.user-message-box {
  background-color: #e1f5fe;
  border: 1px solid #90caf9;
  padding: 10px;
  border-radius: 5px;
}

.admin-message-box {
  background-color: #c8e6c9;
  border: 1px solid #4caf50;
  padding: 10px;
  border-radius: 5px;
}
</style>