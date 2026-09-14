/** Heuristic risk accumulator. Scores are not statistically calibrated probabilities. */
export function updateRisk(previous,signals,graph,role='caller'){
 if(role==='user')return {...previous,spike:0};
 const manipulation=Math.max(signals.fear,signals.isolation,signals.reward,signals.urgency);
 const hazard=Math.max(signals.screen_share,signals.remote_control,signals.otp_request,signals.password,signals.money_transfer*.85,signals.install_app*.50,signals.qr*.45);
 const semantic=Math.max(...Object.values(signals));
 const evidence=.30*semantic+.30*hazard+.25*graph.score+.15*manipulation;
 const spike=(signals.otp_request||signals.password||signals.remote_control)?.35:signals.screen_share?.30:signals.money_transfer&&graph.current>=2?.30:0;
 let risk=.6*(previous.risk??0)+.4*evidence+spike;
 // A critical action cannot be diluted by averaging with a quiet beginning.
 if(signals.otp_request||signals.password||signals.remote_control)risk=Math.max(risk,.92);
 if(signals.screen_share)risk=Math.max(risk,.88+(graph.orderedEdges>=2?.07:0));
 if(signals.money_transfer&&graph.orderedEdges>=2)risk=Math.max(risk,.93);
 return {risk:Math.min(.99,Math.max(0,risk)),semantic,hazard,manipulation,evidence,spike};
}
