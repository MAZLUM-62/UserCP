<template>
    <v-app class="ticket-container" style="background-color: #262626;">
        <v-tabs v-model="tab">
            <v-tab value="my-tickets">Meine Tickets</v-tab>
            <v-tab value="create-ticket">Ticket erstellen</v-tab>
        </v-tabs>

        <v-tab-item v-if="tab === 'my-tickets'" id="my-tickets">
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field variant="outlined" v-model="searchQuery" label="Suchen" outlined></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-data-table :headers="ticketHeaders" :items="tickets" :search="searchQuery" :sort-desc="sortDesc"
                            :sort-by="sortBy" style="background-color: #262626; color: white;"
                            class="ticket-liste-container">

                            <template v-slot:header="{ header }">
                                <th>
                                    {{ header.text }}
                                </th>
                            </template>

                            <template v-slot:item="{ item }">
                                <tr>
                                    <td>{{ item.ticket_id }}</td>
                                    <td>{{ item.subject }}</td>
                                    <td>{{ item.category }}</td>
                                    <td :class="getStatusColorClass(item.status)">{{ item.status }}</td>
                                    <td>{{ formatDateTime(item.updated_at) }}</td>
                                    <td>
                                        <router-link :to="'/tickets/' + item.ticket_id">
                                            <v-btn color="purple" small>
                                                Öffnen
                                            </v-btn>
                                        </router-link>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-container>
        </v-tab-item>

        <v-tab-item v-if="tab === 'create-ticket'" id="create-ticket">
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field variant="outlined" v-model="newTicket.subject" label="Titel" outlined></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-select variant="outlined" class="categorie-list-design" v-model="newTicket.category"
                            :items="categories" label="Kategorie" outlined></v-select>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-textarea variant="outlined" v-model="newTicket.description" label="Beschreibung" outlined
                            :counter="5000"></v-textarea>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-btn @click="createTicket" color="purple">erstellen</v-btn>
                    </v-col>
                </v-row>
            </v-container>

        </v-tab-item>
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right>
            {{ snackbar.message }}
        </v-snackbar>
    </v-app>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            user: null,
            tab: null,
            searchQuery: '',
            snackbar: {
                show: false,
                message: '',
                color: '',
            },
            ticketHeaders: [
                { text: 'Ticket ID', value: 'ticket_id', sortable: true },
                { text: 'Subject', value: 'subject', sortable: true },
                { text: 'Category', value: 'category', sortable: true },
                { text: 'Status', value: 'status', sortable: true },
                { text: 'Last Update', value: 'updated_at', sortable: true },
            ],
            tickets: [],
            categories: ['Support', 'Gewerbe', 'Behörden', 'Crime', 'Bug', 'Beschwerden', 'Bewerbung', 'Sonstiges'],
            newTicket: {
                subject: '',
                category: '',
                description: '',
            },
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

        async createTicket() {
            try {
                await this.getMe();
                const { subject, category, description } = this.newTicket;
                const user_id = this.user ? this.user.user_id : null;
                await axios.post('http://localhost:3001/api/create-ticket', {
                    user_id,
                    subject,
                    category,
                    description,
                }, {
                    withCredentials: true,
                });

                this.snackbar.show = true;
                this.snackbar.message = 'Ticket created successfully.';
                this.snackbar.color = 'success';
                // After creating a ticket, you may want to refetch the tickets from the server
                this.fetchTickets();
            } catch (error) {
                console.error('Error creating ticket:', error.message);
                // Update the snackbar to show an error message
                this.snackbar.show = true;
                this.snackbar.message = 'Error creating ticket.';
                this.snackbar.color = 'error';
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
        async fetchTickets() {
            try {
                const response = await axios.get('http://localhost:3001/api/tickets', {
                    withCredentials: true,
                });

                console.log('Response from server:', response.data);
                this.tickets = response.data;
            } catch (error) {
                console.error('Error fetching tickets:', error.message);
                // Handle the error, e.g., redirect to login page
                if (error.response && error.response.status === 401) {
                    console.log('User is not authenticated. Redirect to login page.');
                    // Redirect or show a login modal
                }
            }
        },
        sortTicketsByColumn(header) {
            if (header.sortable) {
                if (this.sortBy === header.value) {
                    this.sortDesc = !this.sortDesc;
                } else {
                    this.sortBy = header.value;
                    this.sortDesc = false;
                }
            }
        }


    },
    mounted() {
        console.log('Component mounted');
        this.getMe();
        this.fetchTickets();
    },
};
</script>

<style>
.ticket-container {
    color: white;
    padding: 30px;
}

.categorie-list-design {
    background-color: #262626;
    color: white;
}

.ticket-liste-container .column-status .text-red {
    color: red !important;
}

.ticket-liste-container .column-status .text-orange {
    color: orange !important;
}

.ticket-liste-container .column-status .text-green {
    color: green !important;
}

.ticket-liste-container .column-status .text-blue {
    color: blue !important;
}
</style>
