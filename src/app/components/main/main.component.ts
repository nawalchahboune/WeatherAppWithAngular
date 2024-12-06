import { Component, OnInit } from '@angular/core';
import { GraphdbService } from '../../services/GraphdbService.service';
import {
  NgForOf,
  NgOptimizedImage
} from '@angular/common';
import {
  map,
  Observable,
  Subscription,
  forkJoin
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';


let primengComponents = [
  DropdownModule
]


@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    FormsModule,
    ...primengComponents
  ],

  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class TestComponent implements OnInit {
  // @ts-ignore
  selectedId: string | undefined;
  stationIds : string[] =['1','2'];


  // Weather data object
  data: {
    id: string ;
    temperatureAvr?: number;
    temperatureMax?: number;
    temperatureMin?: number;
    Humidity?: number;
    pressureAvr?: number;
    DirectionWind?: string;
    SpeedWindAvr?: number;
    SpeedWindMax?: number;
    SpeedWindMin?: number;
    avgCloudiness?: number;
    soilStatus?: number;
    avgGust?: number;
    precipitations?: number;
    snowHeight?: number;
  } = { id: '1', temperatureAvr: 0, temperatureMax: 0, temperatureMin: 0, Humidity: 0, pressureAvr: 0, DirectionWind: '', SpeedWindAvr: 0, SpeedWindMax: 0, SpeedWindMin: 0 };

  constructor(private meteoService: GraphdbService) {


  }

  ngOnInit(): void {    // @ts-ignore

    this.meteoService.getAllIds().subscribe((data: any) => {
      this.stationIds = data;
      this.selectedId = this.stationIds[0];
      this.fetchStationData(this.selectedId);
    })

  }
  onCategoryChange(event: Event){
    console.log("in onCategoryChange");
    const inputElement = event.target as HTMLInputElement;
    this.selectedId = inputElement.value;
    console.log("id selected :"+ this.selectedId);
    this.data.id =this.selectedId;
    this.fetchStationData(this.selectedId);
    console.log("this.selectedId")
    this.data.SpeedWindMax=334;
  }

  // Fetch data for a specific station
  private fetchStationData(stationId: string): void {

    let combinedObservable$ = forkJoin({
      temperatureAvr: this.meteoService.getTemperatureData(stationId),
      temperatureMax: this.meteoService.getTemperatureMaxData(stationId),
      temperatureMin: this.meteoService.getTemperatureMinData(stationId),
      Humidity: this.meteoService.getHumidityData(stationId),
      DirectionWind: this.meteoService.getAverageWindDirection(stationId),
      pressureAvr: this.meteoService.getPressureAvrData(stationId),
      SpeedWindAvr: this.meteoService.getSpeedWindAvrData(stationId),
      SpeedWindMax: this.meteoService.getSpeedWindMaxData(stationId),
      SpeedWindMin: this.meteoService.getSpeedWindMinData(stationId),
      avgCloudiness: this.meteoService.getAverageCloudiness(stationId),
      avgGust: this.meteoService.getAverageGust(stationId),
      soilStatus: this.meteoService.getSoilStatus(stationId),
      precipitations: this.meteoService.getPrecipitations(stationId),
      snowHeight: this.meteoService.getSnowHeight(stationId),
    });

    combinedObservable$.subscribe(data => {
      this.data.temperatureAvr = (data.temperatureAvr).toFixed(2);
      this.data.temperatureMax = (data.temperatureMax).toFixed(2);
      this.data.temperatureMin = (data.temperatureMin).toFixed(2);
      this.data.Humidity = (data.Humidity).toFixed(2);
      this.data.DirectionWind =data.DirectionWind;
      this.data.pressureAvr = (data.pressureAvr).toFixed(2);
      this.data.SpeedWindAvr = (data.SpeedWindAvr).toFixed(2);
      this.data.SpeedWindMax = (data.SpeedWindMax).toFixed(2);
      this.data.SpeedWindMin = (data.SpeedWindMin).toFixed(2);
      this.data.avgCloudiness = (data.avgCloudiness).toFixed(2);
      this.data.avgGust = (data.avgGust).toFixed(2);
      this.data.soilStatus = (data.soilStatus).toFixed(2)*100;
      this.data.precipitations = (data.precipitations).toFixed(2);
      this.data.snowHeight = (data.snowHeight).toFixed(2);
      
    });


    // Subscribe to each observable and update the data object
    // for (const [key, observable] of Object.entries(requests)) {
    //   observable.subscribe({
    //     next: (data: any) => {
    //       // @ts-ignore
    //       if(key!="DirectionWind"){
    //         // @ts-ignore
    //         this.data[key]=observable.pipe(map(data => parseFloat(data)));
    //       }
    //       if(key=="DirectionWind"){
    //         // @ts-ignore
    //         this.data[key]=observable.pipe(map(data => String(data)));
    //       }
    //     },
    //     error: (err) => {
    //       console.error(`Error fetching ${key}:`, err);
    //     },
    //   });
    // }
  }
}
