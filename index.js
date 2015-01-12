
/**
 * @name amen-break
 */
 
 

 
var turnaround = 1; // set to 0 for the classic turnaround, 1 for random


var bpm = 130;
 
 
 
var bass_drum_harmonics = [1.0, 2.36, 1.72, 1.86, 2.72, 3.64, 4.5, 5.46];
var snare_drum_harmonics = [1.0, 1.6, 2.13, 2.66, 2.3, 2.92, 3.5, 4.07, 4.24, 4.84];


function NoiseMaker(color, decay, base_amp){
  
  var w = 0;
  var v = 0;
  
  return{
    hit : function (vel) {v = vel;},
    set_color: function(c){color = c;},
    set_decay: function(d){decay = d;},
    play : function(){
      if (v*base_amp < 0.001) {
        v = 0;
        return 0;
      }
      
      v *= (1 - decay/sampleRate);
      
      w *= color/(color+1);
      w += v * (2 * Math.random() - 1) * base_amp;
      return w;
    }
  };
  
}

function Drumhead(freq, harmonics, harmonic_power, decay, freq_decay, base_amp){
  
  var w = 0;
  var v = 0;
  var f = 0;
  var t = 0;
  
  return{
    
    set_freq : function(freq){
      f = freq;
    },
    
    set_decay : function (d){
      decay = d;
    },
    
    hit : function (vel) {
      t = 0;
      f = freq;
      v = vel*base_amp;
      
    },
    play : function(){
      
      if (v * f < 0.001){
        v = 0;
        return 0;
      }
      
      for (var i in harmonics){
        w += Math.pow(-1,i) * v * Math.cos(2 * Math.PI * f * harmonics[i] * t) / Math.pow(harmonics[i],harmonic_power) *(2*Math.PI*f)/sampleRate;
      }
      
      w *= (1 - decay/sampleRate);
      v *= (1 - decay/sampleRate);
      if (t < 0.1) f *= (1 - freq_decay/sampleRate);
      
      t += 1/sampleRate;
      
      return w;
    }
  };
}

  
export function Bassdrum(freq, decay, freq_decay, click_amp, base_amp){
  
  var tap_decay = 5*decay;
  
  var drumhead = Drumhead(freq, bass_drum_harmonics, 2, decay, freq_decay, base_amp);
  var drumnoise = NoiseMaker(0, tap_decay, click_amp);
  
  return{
    
    drumhead : drumhead,
    
    drumnoise : drumnoise,
    
    hit : function(v){
      this.drumhead.hit(v);
      this.drumnoise.hit(v);
    },
    
    play : function(){
      return this.drumhead.play() + this.drumnoise.play();
    }
    
  };
  
}


function Snaredrum(freq, decay, noise_amp, drumhead_amp){
  
  var drumhead = Drumhead(freq, snare_drum_harmonics, 1, decay, 0, drumhead_amp);
  var drumnoise = NoiseMaker(20, decay, noise_amp);
  
  
  return{
    
    drumhead : drumhead,
    drumnoise : drumnoise,
    
    hit : function(v){
      
      v *= (Math.random()*2-1) * 0.2 + 1;
      this.drumhead.hit(v);
      this.drumnoise.hit(v);
    },
    
    play : function(){
      return this.drumhead.play() + this.drumnoise.play();
    }
    
  };
  
}



var beats = 0.0;


var bassdrum = Bassdrum(110, 10, 5, 0.05, 1.5);

var hihat = NoiseMaker(0, 30, 0.1);

var snare = Snaredrum(220, 20, 0.2, 1);

var crash = NoiseMaker(1, 5, 0.3);


var snare2 = Snaredrum(440, 50, 0.05, 0.0);
var snare3 = Snaredrum(440, 50, 0.05, 0.1);


function at(t1,t2){return (t1 >= t2 && t1 <= t2+1/sampleRate);}

function each(b, beat, per_beat){
  return at(b%per_beat*60/bpm, beat%per_beat*60/bpm);
}



export function dsp(t) {
 
  beats += 1/sampleRate/60*bpm;
  
  
    
  if (each(beats,0,0.5)) hihat.hit(1);
  if (each(beats,0.25,0.5)) hihat.hit(0.2);
  
  
  if (each(beats,0,0.5)) snare2.hit(1);
  if (each(beats,0,0.25)) snare3.hit(1);

  if (beats%16 < 8){
    
  
    if (each(beats,0,4)) bassdrum.hit(1);
    
    if (each(beats,0.5,4)) bassdrum.hit(0.8);
    
    if (each(beats,1,4)) snare.hit(0.9);
    
    
    if (each(beats,1.75,4)) snare.hit(1);
    
    if (each(beats,2.25,4)) snare.hit(0.8);
    if (each(beats,2.5,4)) bassdrum.hit(0.8);
    if (each(beats,2.75,4)) bassdrum.hit(0.5);
    if (each(beats,3,4)) snare.hit(0.9);
    
    
    if (each(beats,3.75,4)) snare.hit(0.6);
    
  } else if (beats%16 < 12){
  
    if (each(beats,0,4)) bassdrum.hit(1);
    
    if (each(beats,0.5,4)) bassdrum.hit(0.8);
    
    if (each(beats,1,4)) snare.hit(0.9);
    
    
    if (each(beats,1.75,4)) snare.hit(1);
    
    if (each(beats,2.25,4)) snare.hit(0.8);
    if (each(beats,2.5,4)) bassdrum.hit(0.8);
    
    
    
    if (each(beats,3.5,4)) snare.hit(0.9);
    
  } else {
    
    switch (turnaround) {
    
    case 0:
      
      if (each(beats,0.25,4)) snare.hit(0.6);
      if (each(beats,0.5,4)) bassdrum.hit(1);
      if (each(beats,0.75,4)) bassdrum.hit(0.5);
      if (each(beats,1,4)) snare.hit(1);
      
      
      if (each(beats,1.75,4)) snare.hit(1);
      
      if (each(beats,2.25,4)) snare.hit(0.8);
      if (each(beats,2.5,4)) {bassdrum.hit(0.8); crash.hit(1);}
      
      
      
      
      
      
      if (each(beats,2+1/2,4)) snare.hit(0.2);
      if (each(beats,2+3/4,4)) snare.hit(0.3);
      if (each(beats,3,4)) snare.hit(0.5);
      if (each(beats,3+1/4,4)) snare.hit(0.7);
      if (each(beats,3+1/2,4)) snare.hit(0.6);
      if (each(beats,3+3/4,4)) snare.hit(1);
      
      break;
      
    case 1:
      
      if (each(beats,0,0.25)){
        
        if (Math.random() > 0.5) bassdrum.hit(Math.random());
        if (Math.random() > 0.4) snare.hit(Math.random());
        
        
        break;
      }
      
    }
  }
      
  
 
 
  
  var bassdrumplay = bassdrum.play();
  var snareplay = snare.play();
  var hihatplay = hihat.play();
  
  var snare2play = snare2.play();
  var snare3play = snare3.play();
  
  var crashplay = crash.play();
    
    return [
      bassdrumplay * 0.5 + hihatplay * 0.6 + snareplay * 0.4 + snare2play*0.5 + crashplay*0.3, 
      bassdrumplay * 0.5 + hihatplay * 0.4 + snareplay * 0.6 + snare3play*0.5 + crashplay*0.7];
}
