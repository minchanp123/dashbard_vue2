<template>
  <b-table-simple height="100%">
    <b-thead>
      <b-tr class="text-center">
        <b-th id="th_header" style="border-left: 1px solid #e9ecef;">순위</b-th>
        <b-th id="th_header">화제어</b-th>
        <b-th id="th_header">건수</b-th>
        <b-th id="th_header">카테고리</b-th>
        <b-th v-if="len >= 6" id="th_header">비고</b-th>
      </b-tr>
    </b-thead>
    <b-tbody v-if="tableData.length != 0">
      <b-tr class="text-center" v-for="(data, index) in tableData" :key="index" @click="sendTopic(data._id)">
        <b-td id="th_header" style="width: 10%; border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">{{ index + 1 }}</b-td>
        <b-td id="td_header" v-bind:class="{ 'up': data._id == topic && item == 'news' }">{{ data._id }}</b-td>
        <b-td id="td_header">{{ data.tf }}</b-td>
        <b-td id="td_header"
          v-bind:class="{ 'disaster': data.note == '재해', 'war': data.note == '전쟁', 'country': data.note == '국가',
          'disease': data.note == '질병', 'environment': data.note == '환경' }">{{ data.note }}
        </b-td>
        <b-td v-if="len >= 6" id="td_header">{{ data.notice }}</b-td>
      </b-tr>
    </b-tbody>
    <b-tbody v-else>
      <b-tr class="text-center" v-for="i in 10" :key="i">
        <b-td id="td_header"
          style="width: 10%; font-weight: 500; background-color: #f6f9fc; border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">{{ i }}
        </b-td>
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script>
import EventBus from '../EventBus';
import axios from 'axios';

export default {
  name: 'keyword-topic-table',
  props: ["status"],
  data() {
    return {
      tableData: [],
      topic: '',
      item: '',
      len: 0,
      path: '/monitoring1/topic/select_topic'
    }
  },
  watch: {
    status: {
      handler() {
        this.takeTableData();
      },
      deep: true,
    }
  },
  methods: {
    async takeTableData() {
      this.tableData = [];

      this.item = this.status.item;

      if (this.status.item == 'news') {
        this.path = "/monitoring1/topic/select_topic";
      } else if (this.status.item == 'report') {
        this.path = "/monitoring1/topic_report/select_topic_report";
      }

      axios.get(this.path,
        {
          params:
          {
            material: this.status.material,
            startDate: this.status.startDate,
            endDate: this.status.endDate,
          }
        })
        .then((res) => {
          let result = res['data'];
          return result;
        }).then((data) => {
          this.len = Object.keys(data[0]).length

          for (var i of data) {
            i.tf = i.tf.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }

          if (data.length != 10) {
            let dataKey = ['rank', '_id', 'tf', 'note'];
            for (var i = data.length; i < 10; i++) {
              data[i] = {};
              for (var j of dataKey) {
                data[i][j] = '';
              }
            }
          }

          this.tableData = data;
          this.topic = '';

          this.initMaterial();
        });
    },

    async sendTopic(topic) {
      if (topic != '') {
        if (this.item == 'news') {
          if (this.topic == topic) {
            let searchOptions = {
              'item': this.status.item,
              'startDate': this.status.startDate,
              'endDate': this.status.endDate,
              'material': this.status.material,
              'topic': '',
            };
            this.topic = '';
            EventBus.$emit('topic', searchOptions);
          } else {
            let searchOptions = {
              'item': this.status.item,
              'startDate': this.status.startDate,
              'endDate': this.status.endDate,
              'material': this.status.material,
              'topic': topic,
            };
            this.topic = topic;
            EventBus.$emit('topic', searchOptions);
          }
        } else if (this.item == 'report') {
          if (this.topic == topic) {
            let searchOptions = {
              'item': this.status.item,
              'startDate': this.status.startDate,
              'endDate': this.status.endDate,
              'material': this.status.material,
              'topic': '',
            };
            this.topic = '';
            EventBus.$emit('topic', searchOptions);
          } else {
            let searchOptions2 = {
              'item': this.status.item,
              'startDate': this.status.startDate,
              'endDate': this.status.endDate,
              'material': this.status.material,
              'topic': topic,
            };
            this.topic = topic;

            EventBus.$emit('topic_report', searchOptions2);
          }
        }
      }
    },

    initMaterial() {
      let searchOptions = {
        'startDate': this.status.startDate,
        'endDate': this.status.endDate,
        'material': this.status.material,
        'topic': this.topic
      }
      EventBus.$emit('init', searchOptions);
    }
  },
}
</script>

<style>
.centerStyle {
  text-align: center;
}

.rightStyle {
  text-align: right;
}

.up {
  color: red;
}

.equal {
  color: black;
}

.down {
  color: blue;
}

#td_header {
  font-size: 14px;
  background-color: #ffffff;
}

#th_header {
  font-size: 14px;
  font-weight: 500;
  padding: 0.8rem;
  background-color: #f6f9fc;
  vertical-align: middle;
}

.disaster {
  color: #008FFB;
}

.war {
  color: #00E396;
}

.country {
  color: #FEB019;
}

.disease {
  color: #FF4560;
}

.environment {
  color: #775DD0;
}
</style>
