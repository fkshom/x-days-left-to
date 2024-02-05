<script setup lang="ts">
import { ref, watchEffect, watch, toRefs } from 'vue'
import dayjs from 'dayjs'
import ja from 'dayjs/locale/ja';
import arraySupport from 'dayjs/plugin/arraySupport';
import * as holiday_jp from '@holiday-jp/holiday_jp';

import { useDaysStore } from '@/stores/days';
const daysStore = toRefs(useDaysStore())
import { pinia } from '@/main'

const today = dayjs()
const from_year = ref(today.year())
const from_month = ref(today.month() + 1)
const from_day = ref(today.date())
const to_year = daysStore.to_year
const to_month = daysStore.to_month
const to_day = daysStore.to_day
const include_first_day = daysStore.include_first_day
const d_days_left = ref(0)
const wd_weeks_left = ref(0)
const wd_days_left = ref(0)
const md_months_left = ref(0)
const md_days_left = ref(0)
const yd_years_left = ref(0)
const yd_days_left = ref(0)
const ymd_years_left = ref(0)
const ymd_months_left = ref(0)
const ymd_days_left = ref(0)
const weekday_days = ref(0)
const holiday_days = ref(0)
const sunday_or_saturday_days = ref(0)
const national_holiday_days = ref(0)
const national_holiday_days_info = ref<any[]>([])

dayjs.locale("ja")
dayjs.extend(arraySupport)

function create_fromdate(){
  let fromdate = dayjs([from_year.value, from_month.value - 1, from_day.value, 0, 0, 0, 0])
  if(include_first_day.value){
    fromdate = fromdate.add(-1, 'day')
  }
  return fromdate
}

function create_todate(){
  const todate = dayjs([to_year.value, to_month.value - 1, to_day.value, 0, 0, 0, 0])
  return todate
}

// 日数
function calc_d(): number{
  let fromdate = create_fromdate()
  const todate = create_todate()
  const days = todate.diff(fromdate, 'day', true)
  return days
}

// 週数＋日
function calc_wd(): [number, number]{
  let fromdate = create_fromdate()
  const todate = create_todate()

  const weeks = todate.diff(fromdate, 'week')
  fromdate = fromdate.add(weeks, 'week')

  const days = todate.diff(fromdate, 'day')

  return [weeks, days]
}

// 月数＋日
function calc_md(): [number, number]{
  let fromdate = create_fromdate()
  const todate = create_todate()

  const months = todate.diff(fromdate, 'month')
  fromdate = fromdate.add(months, 'month')

  const days = todate.diff(fromdate, 'day')

  return [months, days]
}

// 年数＋日
function calc_yd(): [number, number]{
  let fromdate = create_fromdate()
  const todate = create_todate()

  const years = todate.diff(fromdate, 'year')
  fromdate = fromdate.add(years, 'year')

  const days = todate.diff(fromdate, 'day')

  return [years, days]
}

// 年＋月＋日
function calc_ymd(): [number, number, number]{
  let fromdate = create_fromdate()
  const todate = create_todate()

  // https://stackoverflow.com/a/33988284
  const years = todate.diff(fromdate, 'year')
  fromdate = fromdate.add(years, 'year')

  const months = todate.diff(fromdate, 'month')
  fromdate = fromdate.add(months, 'month')

  const days = todate.diff(fromdate, 'day')

  return [years, months, days]
}

function calc_weekday_holiday_days(): [number, number, number, number, any[]]{
  let fromdate = create_fromdate()
  const todate = create_todate()
  const days = todate.diff(fromdate, 'day')
  let weekday_days = 0
  let holiday_days = 0
  let sunday_or_saturday_days = 0
  let national_holiday_days = 0
  let national_holiday_days_info = []
  const holiday_arr = holiday_jp.between(fromdate.toDate(), todate.toDate())
  const holiday_map = new Map();
  holiday_arr.forEach((e) => {
    holiday_map.set(Math.floor(e.date.getTime() / 1000 / 60 / 60 / 24).toString(), e)
  })

  for(let i = 0; i< days; i++){
    // 土日？
    const is_sunday_or_saturday = [0, 6].includes(fromdate.day())

    const h = holiday_map.get(Math.floor(fromdate.unix() / 60 / 60 / 24).toString())
    const is_national_holiday = !!h

    if(is_sunday_or_saturday == false && is_national_holiday == false){
      weekday_days++
    } else {
      holiday_days++
      if(is_sunday_or_saturday == true){
        sunday_or_saturday_days++
      }
      if(is_national_holiday == true){
        national_holiday_days++
        national_holiday_days_info.push(h)
      }
    }

    fromdate = fromdate.add(1, 'day')
  }
  return [weekday_days, holiday_days, sunday_or_saturday_days, national_holiday_days, national_holiday_days_info]
}

watch([from_year, from_month, from_day, pinia.state, to_month, to_day, include_first_day], () => {
  d_days_left.value = calc_d();
  [wd_weeks_left.value, wd_days_left.value] = calc_wd();
  [md_months_left.value, md_days_left.value] = calc_md();
  [yd_years_left.value, yd_days_left.value] = calc_yd();
  [ymd_years_left.value, ymd_months_left.value, ymd_days_left.value] = calc_ymd();
  [weekday_days.value, holiday_days.value, sunday_or_saturday_days.value, national_holiday_days.value, national_holiday_days_info.value] = calc_weekday_holiday_days();
}, {
  immediate: true,
})


</script>

<template>
  <main>
    <v-row align="end">
      開始日
      <v-text-field :hide-details="true" v-model.number="from_year"></v-text-field>年
      <v-text-field :hide-details="true" v-model.number="from_month"></v-text-field>月
      <v-text-field :hide-details="true" v-model.number="from_day"></v-text-field>日
    </v-row>
    <v-row align="end">
      終了日
      <v-text-field :hide-details="true" v-model.number="to_year"></v-text-field>年
      <v-text-field :hide-details="true" v-model.number="to_month"></v-text-field>月
      <v-text-field :hide-details="true" v-model.number="to_day"></v-text-field>日
    </v-row>
    <v-row align="end">
      <v-switch label="初日を含む" color="indigo" v-model="include_first_day"></v-switch>
    </v-row>
    <v-row align="end">
      <v-col cols="3">日数</v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3">{{ d_days_left }} 日</v-col>
    </v-row>
    <v-row align="end">
      <v-col cols="3">週数</v-col>
      <v-col cols="3">{{ wd_weeks_left }} 週 </v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3">＋ {{ wd_days_left }} 日</v-col>
    </v-row>
    <v-row align="end">
      <v-col cols="3">月数</v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3">{{ md_months_left }} ヶ月</v-col>
      <v-col cols="3">＋ {{ md_days_left }} 日</v-col>
    </v-row>
    <v-row align="end">
      <v-col cols="3">年数</v-col>
      <v-col cols="3">{{ yd_years_left }} ヶ年</v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3">＋ {{ yd_days_left }} 日</v-col>
    </v-row>
    <v-row align="end">
      <v-col cols="3">年月数</v-col>
      <v-col cols="3">{{ ymd_years_left }} ヶ年</v-col>
      <v-col cols="3">＋ {{ ymd_months_left }} ヶ月</v-col>
      <v-col cols="3">＋ {{ ymd_days_left }} 日</v-col>
    </v-row>
    <v-row align="end">
      <ul>
        <li>平日数 {{ weekday_days }} 日</li>
        <li>休日数（土日祝）: {{ holiday_days }} 日 （うち土日 {{ sunday_or_saturday_days }} 日、うち祝日 {{ national_holiday_days }} 日）</li>
      </ul>
      
    </v-row>
    <v-row align="end">
      ;
    </v-row>
    <v-row align="end">
      <ul>
        <li v-for="e in national_holiday_days_info" key="e.date">
          {{ dayjs(e.date).format('YYYY年MM月DD日(ddd)') }} {{ e.name }}
        </li>
      </ul>
    </v-row>


  </main>
</template>
