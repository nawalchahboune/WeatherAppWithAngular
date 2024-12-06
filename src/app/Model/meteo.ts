import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meteo {
  id: string;
  temperatureAvr: number;
  pressureAvr: number;
  temperatureMin: number;
  temperatureMax: number;
}
