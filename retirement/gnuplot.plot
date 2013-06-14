set samples 10000;
set xlabel "Savings percentage"
set ylabel "Years until retirement"
set key noautotitle
set key box
set key title "APY"
set title "Years until retirement"
plot [x=0:100] [y=0:60] log(1/(x/100))/log(1+0.01) title "1%", log(1/(x/100))/log(1+0.025) title "2.5%", log(1/(x/100))/log(1+0.05) title "5%", log(1/(x/100))/log(1+0.075) title "7.5%", log(1/(x/100))/log(1+0.1) title "10%"
