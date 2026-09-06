import React, {useEffect, useMemo, useState} from 'react';
import {SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, StatusBar} from 'react-native';

const GREEN='#087F5B', DARK='#12372D', BG='#F5F8F6', MUTED='#6B7D76', PINK='#FCECEF';
const CUSTOMER_CARE_RATE=150;
const PARTNER_CARE_RATE=100;
const TRAVEL_RATE=7;
const COMPLETION_BONUS=40;
const MIN_BILLABLE_MINUTES=30;
const DISTANCE_KM=12;

function money(n){ return `₹${n.toFixed(2)}`; }
function minutesToHours(m){ return m/60; }
function formatDuration(totalSeconds){
  const h=Math.floor(totalSeconds/3600);
  const m=Math.floor((totalSeconds%3600)/60);
  const s=totalSeconds%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function billableMinutes(seconds){
  const actual=Math.ceil(seconds/60);
  return Math.max(MIN_BILLABLE_MINUTES, actual);
}
function Header({title,onBack}){return <View style={s.header}>{onBack?<Pressable onPress={onBack} style={s.back}><Text style={{fontSize:28}}>‹</Text></Pressable>:<View style={{width:32}}/>}<Text style={s.headerTitle}>{title}</Text><Text style={s.help}>Help</Text></View>}
function Button({children,onPress,disabled}){return <Pressable disabled={disabled} onPress={onPress} style={[s.button,disabled&&{opacity:.45}]}><Text style={s.buttonText}>{children}</Text></Pressable>}
function Card({children}){return <View style={s.card}>{children}</View>}
function PriceRow({label,value,bold}){return <View style={s.priceRow}><Text style={[s.muted,bold&&s.bold,{flex:1}]}>{label}</Text><Text style={[s.price,bold&&{fontSize:19}]}>{money(value)}</Text></View>}

export default function App(){
 const [role,setRole]=useState('customer');
 const [screen,setScreen]=useState('home');
 const [duration,setDuration]=useState(3);
 const [careStartedAt,setCareStartedAt]=useState(null);
 const [careEndedAt,setCareEndedAt]=useState(null);
 const [now,setNow]=useState(Date.now());
 const [carePerson,setCarePerson]=useState('Father');

 useEffect(()=>{
   if(!careStartedAt || careEndedAt) return;
   const id=setInterval(()=>setNow(Date.now()),1000);
   return ()=>clearInterval(id);
 },[careStartedAt,careEndedAt]);

 const elapsedSeconds=careStartedAt ? Math.max(0, Math.floor(((careEndedAt||now)-careStartedAt)/1000)) : 0;
 const billMinutes=billableMinutes(elapsedSeconds);
 const travel=DISTANCE_KM*TRAVEL_RATE;
 const customerCare=minutesToHours(billMinutes)*CUSTOMER_CARE_RATE;
 const partnerCare=minutesToHours(billMinutes)*PARTNER_CARE_RATE;
 const customerTotal=travel+customerCare;
 const partnerTotal=travel+partnerCare+COMPLETION_BONUS;
 const seraCommission=customerTotal-partnerTotal;
 const actualCareMinutes=Math.ceil(elapsedSeconds/60);
 const displayCareMinutes=careStartedAt ? Math.max(MIN_BILLABLE_MINUTES,actualCareMinutes) : 0;

 const reset=()=>{setCareStartedAt(null);setCareEndedAt(null);setNow(Date.now());setScreen('home');setRole('customer');};

 const Home=()=> <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}>
   <View style={s.brandRow}><View><Text style={s.logo}>SERA</Text><Text style={s.tag}>Everyday help, on demand.</Text></View><View style={s.avatar}><Text>AC</Text></View></View>
   <View style={s.roleBar}><Text style={s.roleLabel}>Demo mode</Text><View style={s.roleSwitch}><Pressable onPress={()=>setRole('customer')} style={[s.roleBtn,role==='customer'&&s.roleBtnActive]}><Text style={role==='customer'?s.roleActiveText:s.roleText}>Customer</Text></Pressable><Pressable onPress={()=>setRole('partner')} style={[s.roleBtn,role==='partner'&&s.roleBtnActive]}><Text style={role==='partner'?s.roleActiveText:s.roleText}>Partner</Text></Pressable></View></View>
   {role==='customer'?<Card><View style={s.heroIcon}><Text style={{fontSize:28,color:'#D94B70'}}>♥</Text></View><Text style={s.heroTitle}>When you can't be there,</Text><Text style={s.heroTitle}>SERA can be there.</Text><Text style={s.muted}>Book a Care Partner to accompany your loved one to a hospital, clinic or important visit.</Text><Button onPress={()=>setScreen('care')}>Book SERA Care</Button></Card>:<Card><View style={s.partnerIcon}><Text style={{fontSize:26}}>₹</Text></View><Text style={s.heroTitle}>Partner dashboard</Text><Text style={s.muted}>See Care requests, exact earnings and your payout before accepting.</Text><Button onPress={()=>setScreen('partnerRequest')}>View Care Request</Button></Card>}
   <Text style={s.section}>Services</Text><View style={s.grid}>{[['🏍️','Bike Taxi'],['📦','Parcel'],['🛍️','Buy & Bring'],['🖨️','Print/Xerox']].map(x=><View key={x[1]} style={s.service}><Text style={{fontSize:25}}>{x[0]}</Text><Text style={s.serviceText}>{x[1]}</Text></View>)}</View>
   <Card><Text style={s.bold}>SERA Care pricing engine</Text><Text style={s.muted}>Customer: ₹{CUSTOMER_CARE_RATE}/hour • Partner: ₹{PARTNER_CARE_RATE}/hour • Travel: ₹{TRAVEL_RATE}/km • Completion: ₹{COMPLETION_BONUS}</Text><Text style={s.muted}>Care is billed by exact verified minutes, with a {MIN_BILLABLE_MINUTES}-minute minimum.</Text></Card>
 </ScrollView></SafeAreaView>;

 const Care=()=> <SafeAreaView style={s.safe}><Header title="SERA Care" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={s.container}>
   <View style={[s.careBanner,{backgroundColor:PINK}]}><Text style={{fontSize:26,color:'#D94B70'}}>♥</Text><View style={{flex:1,marginLeft:12}}><Text style={s.bold}>More than a ride.</Text><Text style={s.muted}>Real human support.</Text></View></View>
   <Text style={s.section}>Who needs assistance?</Text><View style={s.chips}>{['Father','Mother','Grandparent','Other'].map(x=><Pressable key={x} onPress={()=>setCarePerson(x)} style={[s.chip,carePerson===x&&s.chipSelected]}><Text style={s.chipText}>{x}</Text></Pressable>)}</View>
   <Text style={s.section}>Trip</Text><Card><Text style={s.label}>Pickup</Text><Text style={s.value}>🏠 Home</Text><Text style={s.label}>Destination</Text><Text style={s.value}>🏥 CMC Hospital</Text><Text style={s.label}>Purpose</Text><Text style={s.value}>Doctor Consultation</Text></Card>
   <Button onPress={()=>setScreen('duration')}>Continue</Button>
 </ScrollView></SafeAreaView>;

 const Duration=()=> <SafeAreaView style={s.safe}><Header title="Care Duration" onBack={()=>setScreen('care')}/><ScrollView contentContainerStyle={s.container}><Text style={s.h1}>Expected Care duration</Text><Text style={s.muted}>This is only an estimate. The final bill uses actual verified Care time.</Text><View style={s.durationGrid}>{[1,2,3,4,5].map(h=><Pressable key={h} onPress={()=>setDuration(h)} style={[s.duration,{borderColor:duration===h?GREEN:'#D9E3DE',backgroundColor:duration===h?'#EAF7F1':'white'}]}><Text style={s.durationNum}>{h}</Text><Text style={s.muted}>hour{h>1?'s':''}</Text></Pressable>)}</View><Card><Text style={s.bold}>₹{CUSTOMER_CARE_RATE}/hour customer Care rate</Text><Text style={s.muted}>Billed per minute. Minimum {MIN_BILLABLE_MINUTES} minutes. Care starts only after arrival + Start Care.</Text></Card><Button onPress={()=>setScreen('review')}>Review Price</Button></ScrollView></SafeAreaView>;

 const Review=()=> <SafeAreaView style={s.safe}><Header title="Review & Confirm" onBack={()=>setScreen('duration')}/><ScrollView contentContainerStyle={s.container}><Text style={s.h1}>SERA Care</Text><Card><Text style={s.rowLabel}>Person <Text style={s.value}>{carePerson}</Text></Text><Text style={s.rowLabel}>Route <Text style={s.value}>Home → CMC Hospital</Text></Text><Text style={s.rowLabel}>Purpose <Text style={s.value}>Doctor Consultation</Text></Text><Text style={s.rowLabel}>Expected <Text style={s.value}>{duration} hours</Text></Text></Card><Card><Text style={s.bold}>Estimated price</Text><PriceRow label={`Travel (${DISTANCE_KM} km × ₹${TRAVEL_RATE})`} value={travel}/><PriceRow label={`Care estimate (${duration}h × ₹${CUSTOMER_CARE_RATE})`} value={duration*CUSTOMER_CARE_RATE}/><View style={s.line}/><PriceRow label="Estimated total" value={travel+duration*CUSTOMER_CARE_RATE} bold/></Card><Text style={s.note}>Final amount is based on exact verified Care time. Example: 1h 47m means 107 billable minutes, not 2 hours.</Text><Button onPress={()=>setScreen('matched')}>Confirm & Find Care Partner</Button></ScrollView></SafeAreaView>;

 const Matched=()=> <SafeAreaView style={s.safe}><Header title="Partner Matched" onBack={()=>setScreen('review')}/><ScrollView contentContainerStyle={s.container}><Card><View style={s.partnerRow}><View style={s.partnerAvatar}><Text style={{fontSize:24}}>K</Text></View><View style={{flex:1}}><Text style={s.bold}>Karthik V</Text><Text style={s.muted}>✓ Verified · ★ 4.9 · 320+ trips</Text></View></View><Text style={s.arrive}>Arriving in 6 min</Text><Text style={s.muted}>Live tracking is on.</Text></Card><Card><Text style={s.bold}>Estimated booking</Text><PriceRow label="Travel" value={travel}/><PriceRow label={`Care (${duration}h estimate)`} value={duration*CUSTOMER_CARE_RATE}/><PriceRow label="Estimated total" value={travel+duration*CUSTOMER_CARE_RATE} bold/></Card><Text style={s.note}>The Care timer stays OFF during travel. It starts only after handover verification and Start Care.</Text><Button onPress={()=>setScreen('start')}>Partner Arrived</Button></ScrollView></SafeAreaView>;

 const Start=()=> <SafeAreaView style={s.safe}><Header title="Start Care" onBack={()=>setScreen('matched')}/><ScrollView contentContainerStyle={s.container}><Card><View style={s.checkCircle}><Text style={{fontSize:26}}>✓</Text></View><Text style={s.h1}>Partner is here</Text><Text style={s.muted}>Verify the partner and hand over your loved one. No Care time has been counted yet.</Text><View style={s.verify}><Text style={s.bold}>Karthik V</Text><Text style={s.muted}>SERA Partner ID · SV-2048</Text></View><Button onPress={()=>{setCareStartedAt(Date.now());setCareEndedAt(null);setNow(Date.now());setScreen('active')}}>Start Care</Button></Card></ScrollView></SafeAreaView>;

 const Active=()=> <SafeAreaView style={s.safe}><Header title="Care in Progress"/><ScrollView contentContainerStyle={s.container}><View style={s.live}><Text style={s.liveLabel}>● CARE ACTIVE</Text><Text style={s.timer}>{formatDuration(elapsedSeconds)}</Text><Text style={s.muted}>Verified Care time</Text></View><Card><Text style={s.bold}>Customer current fare</Text><PriceRow label="Travel" value={travel}/><PriceRow label={`Care · ${displayCareMinutes} billable min`} value={customerCare}/><View style={s.line}/><PriceRow label="Current total" value={customerTotal} bold/></Card><Card><Text style={s.bold}>Partner current earning</Text><PriceRow label="Travel payout" value={travel}/><PriceRow label={`Care payout · ${displayCareMinutes} min`} value={partnerCare}/><PriceRow label="Completion bonus" value={COMPLETION_BONUS}/><View style={s.line}/><PriceRow label="Current payout" value={partnerTotal} bold/></Card><Text style={s.note}>Tap End Care when assistance is finished. The timer stops immediately and SERA calculates the final amount.</Text><Button onPress={()=>{setCareEndedAt(Date.now());setNow(Date.now());setScreen('ended')}}>End Care</Button></ScrollView></SafeAreaView>;

 const Ended=()=> <SafeAreaView style={s.safe}><Header title="Care Completed"/><ScrollView contentContainerStyle={s.container}><Card><View style={s.checkCircle}><Text style={{fontSize:26}}>✓</Text></View><Text style={s.h1}>Care ended</Text><Text style={s.muted}>Exact verified duration: {formatDuration(elapsedSeconds)}</Text><PriceRow label={`Travel · ${DISTANCE_KM} km`} value={travel}/><PriceRow label={`Care · ${billMinutes} billable min`} value={customerCare}/><View style={s.line}/><PriceRow label="Customer total" value={customerTotal} bold/></Card><Card><Text style={s.bold}>Partner payout</Text><PriceRow label="Travel" value={travel}/><PriceRow label={`Care · ${billMinutes} billable min`} value={partnerCare}/><PriceRow label="Completion bonus" value={COMPLETION_BONUS}/><View style={s.line}/><PriceRow label="Partner receives" value={partnerTotal} bold/></Card><Card><Text style={s.bold}>SERA commission</Text><Text style={s.commission}>{money(seraCommission)}</Text><Text style={s.muted}>Customer payment minus partner payout in this prototype.</Text></Card><Button onPress={reset}>New Demo</Button></ScrollView></SafeAreaView>;

 const PartnerRequest=()=> <SafeAreaView style={s.safe}><Header title="Care Request" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={s.container}><Card><Text style={s.bold}>SERA Care request</Text><Text style={s.label}>Person</Text><Text style={s.value}>{carePerson}</Text><Text style={s.label}>Route</Text><Text style={s.value}>Home → CMC Hospital → Home</Text><Text style={s.label}>Expected duration</Text><Text style={s.value}>{duration} hours (estimate)</Text></Card><Card><Text style={s.bold}>Your earning estimate</Text><PriceRow label={`Travel · ${DISTANCE_KM} km × ₹${TRAVEL_RATE}`} value={travel}/><PriceRow label={`Care · ${duration}h × ₹${PARTNER_CARE_RATE}`} value={duration*PARTNER_CARE_RATE}/><PriceRow label="Completion bonus" value={COMPLETION_BONUS}/><View style={s.line}/><PriceRow label="Estimated payout" value={travel+duration*PARTNER_CARE_RATE+COMPLETION_BONUS} bold/></Card><Text style={s.note}>Actual Care payout is calculated by verified minutes. The estimate is not a fixed 3-hour payment. Care starts only after arrival and Start Care.</Text><Button onPress={()=>setScreen('start')}>Accept Care Request</Button></ScrollView></SafeAreaView>;

 if(screen==='home') return <Home/>;
 if(screen==='care') return <Care/>;
 if(screen==='duration') return <Duration/>;
 if(screen==='review') return <Review/>;
 if(screen==='matched') return <Matched/>;
 if(screen==='start') return <Start/>;
 if(screen==='active') return <Active/>;
 if(screen==='partnerRequest') return <PartnerRequest/>;
 return <Ended/>;
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:BG,paddingTop:StatusBar.currentHeight||0},container:{padding:20,paddingBottom:40},brandRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},logo:{fontSize:30,fontWeight:'900',letterSpacing:2,color:GREEN},tag:{color:MUTED},avatar:{width:42,height:42,borderRadius:21,backgroundColor:'#DDF1E9',alignItems:'center',justifyContent:'center'},roleBar:{backgroundColor:'white',borderRadius:14,padding:6,marginBottom:14,borderWidth:1,borderColor:'#E5ECE8',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},roleLabel:{color:MUTED,fontWeight:'700',marginLeft:8},roleSwitch:{flexDirection:'row'},roleBtn:{paddingVertical:8,paddingHorizontal:12,borderRadius:10},roleBtnActive:{backgroundColor:'#EAF7F1'},roleText:{color:MUTED,fontWeight:'700'},roleActiveText:{color:GREEN,fontWeight:'900'},card:{backgroundColor:'white',borderRadius:18,padding:18,marginBottom:14,borderWidth:1,borderColor:'#E5ECE8'},heroIcon:{width:54,height:54,borderRadius:27,backgroundColor:PINK,alignItems:'center',justifyContent:'center',marginBottom:12},partnerIcon:{width:54,height:54,borderRadius:27,backgroundColor:'#EAF7F1',alignItems:'center',justifyContent:'center',marginBottom:12,color:GREEN},heroTitle:{fontSize:23,fontWeight:'800',color:DARK},muted:{color:MUTED,lineHeight:21},button:{backgroundColor:GREEN,paddingVertical:15,borderRadius:14,alignItems:'center',marginTop:14},buttonText:{color:'white',fontSize:16,fontWeight:'800'},section:{fontSize:17,fontWeight:'800',color:DARK,marginTop:6,marginBottom:10},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},service:{backgroundColor:'white',width:'48%',padding:18,borderRadius:16,borderWidth:1,borderColor:'#E5ECE8'},serviceText:{marginTop:8,fontWeight:'700',color:DARK},careBanner:{borderRadius:18,padding:16,flexDirection:'row',alignItems:'center',marginBottom:8},bold:{fontWeight:'800',color:DARK,fontSize:16},chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:4},chip:{paddingVertical:11,paddingHorizontal:16,borderRadius:22,borderWidth:1,borderColor:'#CFE0D8',backgroundColor:'white'},chipSelected:{backgroundColor:'#EAF7F1',borderColor:GREEN},chipText:{fontWeight:'700',color:DARK},label:{fontSize:12,color:MUTED,marginTop:8},value:{fontWeight:'700',color:DARK},h1:{fontSize:25,fontWeight:'850',color:DARK,marginBottom:8},durationGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginVertical:18},duration:{width:'30%',aspectRatio:1,borderRadius:16,borderWidth:2,alignItems:'center',justifyContent:'center'},durationNum:{fontSize:28,fontWeight:'900',color:DARK},note:{backgroundColor:'#EAF7F1',padding:14,borderRadius:14,color:DARK,lineHeight:20,marginVertical:4},rowLabel:{paddingVertical:8,color:MUTED},priceRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:8},price:{fontWeight:'800',color:DARK},line:{height:1,backgroundColor:'#E6ECE9',marginVertical:6},partnerRow:{flexDirection:'row',alignItems:'center'},partnerAvatar:{width:50,height:50,borderRadius:25,backgroundColor:'#DDF1E9',alignItems:'center',justifyContent:'center',marginRight:12},arrive:{fontSize:20,fontWeight:'900',color:GREEN,marginTop:18},verify:{backgroundColor:'#F5F8F6',padding:14,borderRadius:12,marginTop:14},checkCircle:{width:54,height:54,borderRadius:27,backgroundColor:'#EAF7F1',alignItems:'center',justifyContent:'center',marginBottom:12},live:{backgroundColor:'#EAF7F1',borderRadius:22,padding:26,alignItems:'center',marginBottom:14},liveLabel:{fontWeight:'900',color:GREEN,letterSpacing:1},timer:{fontSize:48,fontWeight:'900',color:DARK,marginVertical:5},commission:{fontSize:30,fontWeight:'900',color:GREEN,marginVertical:6},header:{height:58,flexDirection:'row',alignItems:'center',paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#E2EAE6',backgroundColor:'white'},back:{width:32},headerTitle:{fontSize:18,fontWeight:'800',color:DARK,flex:1},help:{color:GREEN,fontWeight:'700'}});
