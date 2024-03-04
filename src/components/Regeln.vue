<template>
  <v-app class="regeln-container" style="background-color: #262626;">
    <v-container fluid fill-height>
      <h1>Serverregeln</h1>
      <ul class="rules-list">
        <li v-for="(section, index) in rules" :key="index">
          <ul>
            <li class="rules-list-style" v-for="(rule, ruleIndex) in section.regeln" :key="ruleIndex">
              <strong class="sub-rule-title">{{ rule.titel }}</strong>
              <ol class="rules-list-style-push">
                <li v-for="(subpoint, subpointIndex) in rule.unterpunkte" :key="subpointIndex">
                  <span>{{ subpoint.titel }}</span>
                  <ol class="rules-list-style-push">
                    <li v-for="(item, itemIndex) in subpoint.unterpunkte" :key="itemIndex">
                      {{ item }}
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
          </ul>
        </li>
      </ul>
    </v-container>
  </v-app>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      rules: [],
    };
  },
  created() {
    this.fetchRules();
  },
  methods: {
    async fetchRules() {
      try {
        const response = await axios.get('http://localhost:3001/api/rules');
        this.rules = response.data;
      } catch (error) {
        console.error('Fehler beim Laden der Regeln:', error);
        console.error('Error response:', error.response);
      }
    },
  },
};
</script>

<style>
.regeln-container {
  color: white;
  padding: 30px;
}

.rules-list {
  list-style-type: none;
  padding: 0;
}

.rules-list-style {
  list-style-type: none;
}

.rules-list-style-push {
  padding-left: 50px;
}
</style>
