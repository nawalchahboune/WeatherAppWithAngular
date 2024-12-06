import { Injectable } from '@angular/core';
import {
  map,
  Observable
} from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Parser } from 'graphql/language/parser';
@Injectable({
  providedIn: 'root', // Ensure the service is provided globally
})
export class GraphdbService {
  private graphDBEndpoint= '/test2';

constructor(private http: HttpClient) {

}

  getAllIds(): Observable<number[]> {
    const query = `
      SELECT DISTINCT ?station
      WHERE {
          ?station a <http://meteo.com/Station> .
      }
      ORDER BY ?station
    `;
    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query', // Indique une requête SPARQL
      'Accept': 'application/json',              // Demande une réponse JSON
    });
  
    return this.http.post<Observable<string[]>>(this.graphDBEndpoint, query, { headers }).pipe(
        map((response: any) => { 
          // Vérifiez que la réponse contient des résultats
          if (response && response.results && response.results.bindings) {
            // Récupérez les valeurs des stations
            return response.results.bindings.map((binding: any) => {
              return binding.station.value.match(/#(\d+)/)[1];
            }
               
            );
          }
          // Retournez un tableau vide si aucun résultat
          return [];
        })
      );
  }
  getTemperatureData(stationId: string): Observable<any> {
    const query = `
    BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station (AVG(?tempCelsius) AS ?averageTempCelsius)
WHERE {
    # Récupérer la température pour une station spécifique
    ?station <hasTemp> ?tempKelvin .

    # Convertir la température de Kelvin en Celsius
    BIND(xsd:double(STR(?tempKelvin)) - 273.15 AS ?tempCelsius)

    # Filtrer pour une station spécifique
    FILTER(?station = <http://meteo.com/Station#${stationId}>)
}
GROUP BY ?station
ORDER BY ?station

    `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    console.log(query)

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
          return response.results.bindings.length > 0 ? parseFloat(response.results.bindings[0].averageTempCelsius.value) : -1
      }
        ));
  }
  getTemperatureMaxData(stationId: string): Observable<any> {
     // BASE <http://meteo.com/>
    // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    // SELECT ?station (MAX(xsd:double(STR(?temp)) - 273.15) AS ?maxTempCelsius)
    // WHERE {
    //     ?station <hasTemp> ?temp .
    //     FILTER(?station = <http://meteo.com/Station#${stationId}>)
    // }
    // GROUP BY ?station
    const query = `
   
        BASE <http://meteo.com/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?station (MAX(xsd:double(STR(?temp)) - 273.15) AS ?maxTempCelsius) (MIN(xsd:double(STR(?temp)) - 273.15) AS ?minTempCelsius)
    WHERE {
        # Accéder aux températures
        ?station <hasTemp> ?temp .
        FILTER(?station = <http://meteo.com/Station#${stationId}>)

    }
    GROUP BY ?station
    ORDER BY ?station

      `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log("in getTemperatureMaxData");
        console.log(response.results.bindings.length>0);
         return response.results.bindings.length>0 ? parseFloat( response.results.bindings[0].maxTempCelsius.value ):-1
        }
      )
    );
  }
  getTemperatureMinData(stationId: string): Observable<any> {
    const query = `
    BASE <http://meteo.com/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?station (MIN(xsd:double(STR(?temp)) - 273.15) AS ?minTempCelsius)
    WHERE {
        ?station <hasTemp> ?temp .
        FILTER(?station = <http://meteo.com/Station#${stationId}>)
    }
    GROUP BY ?station
  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) =>{
        console.log(response.results.bindings.length>0);
        return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].minTempCelsius.value) :-1

      }
      )
    );
  }

  getHumidityData(stationId: string): Observable<any> {
    const query = `
    BASE <http://meteo.com/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?station
           (AVG(xsd:float(REPLACE(STR(?humidity), "http://meteo.com/", ""))) AS ?avgHumidity)
    WHERE {
        ?station <hasHumidity> ?humidity .

        # Exclure les valeurs manquantes ou invalides
        FILTER(STR(?humidity) != "" && STR(?humidity) != "mq")
        FILTER(?station = <http://meteo.com/Station#${stationId}>)
    }
    GROUP BY ?station
    ORDER BY ?station
  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log(response.results.bindings.length>0);

          return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].avgHumidity.value) :-1;
      })
    );
  }


  getPressureAvrData(stationId: string): Observable<any> {
    const query = `
    BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station (AVG(xsd:double(?normalizedPressure)) AS ?averagePressure)
WHERE {
    ?station <hasSeaPressure> ?pressure .

    BIND(xsd:double(STR(?pressure)) AS ?normalizedPressure)

    FILTER(?station = <http://meteo.com/Station#${stationId}>)
}
GROUP BY ?station
ORDER BY ?station

  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log(response.results.bindings.length>0);

        return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].averagePressure.value):-1;
      })
    );
  }

  getSpeedWindAvrData(stationId: string): Observable<any> {
    
    // BASE <http://meteo.com/>
    // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    // SELECT ?station
    //        (AVG(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?avgWindSpeed)
    //        (MAX(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?maxWindSpeed)
    //        (MIN(?nonZeroWindSpeed) AS ?minWindSpeed)
    // WHERE {
    //     ?station <hasWindSpeed> ?windSpeed .

    //     # Convertir la vitesse du vent en valeur numérique
    //     BIND(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", "")) AS ?windSpeedValue)

    //     # Filtrer les valeurs nulles ou égales à zéro pour le calcul du minimum
    //     FILTER(?windSpeedValue > 0)
    //     BIND(?windSpeedValue AS ?nonZeroWindSpeed)

    //     # Filtrer pour la station spécifique
    //     FILTER(?station = <http://meteo.com/Station#${stationId}>)
    // }
    // GROUP BY ?station
    // ORDER BY ?station
    
    const query = `

    BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?avgWindSpeed)
       (MAX(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?maxWindSpeed)
       (MIN(?nonZeroWindSpeed) AS ?minWindSpeed)
WHERE {
    # Récupérer la station et la vitesse du vent
    ?station <hasWindSpeed> ?windSpeed .

    # Extraire la valeur numérique de la vitesse du vent
    BIND(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", "")) AS ?windSpeedValue)

    # Ignorer les valeurs nulles ou égales à zéro pour le calcul du min
    FILTER(?windSpeedValue > 0)
    BIND(?windSpeedValue AS ?nonZeroWindSpeed)
   
    FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station
  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log(response.results.bindings.length>0);

        return  response.results.bindings.length>0 ?parseFloat(response.results.bindings[0].avgWindSpeed.value):-1;
      }),
    );
  }


  getSpeedWindMaxData(stationId: string): Observable<any> {
    
    // BASE <http://meteo.com/>
    // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    // SELECT ?station
    //        (MAX(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?maxWindSpeed)
    // WHERE {
    //     ?station <hasWindSpeed> ?windSpeed .

    //     # Convertir la vitesse du vent en valeur numérique
    //     BIND(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", "")) AS ?windSpeedValue)

    //     # Filtrer pour la station spécifique
    //     FILTER(?station = <http://meteo.com/Station#${stationId}>)
    // }
    // GROUP BY ?station
    const query = `

    BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?avgWindSpeed)
       (MAX(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?maxWindSpeed)
       (MIN(?nonZeroWindSpeed) AS ?minWindSpeed)
WHERE {
    # Récupérer la station et la vitesse du vent
    ?station <hasWindSpeed> ?windSpeed .

    # Extraire la valeur numérique de la vitesse du vent
    BIND(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", "")) AS ?windSpeedValue)

    # Ignorer les valeurs nulles ou égales à zéro pour le calcul du min
    FILTER(?windSpeedValue > 0)
    BIND(?windSpeedValue AS ?nonZeroWindSpeed)
   
    FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station
  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log(response.results.bindings.length>0);

        return response.results.bindings.length>0 ? parseFloat( response.results.bindings[0].maxWindSpeed.value):-1;
      })
    );
  }
  getSpeedWindMinData(stationId: string): Observable<any> {
    
    // BASE <http://meteo.com/>
    // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    // SELECT ?station
    //        (MIN(?nonZeroWindSpeed) AS ?minWindSpeed)
    // WHERE {
    //     ?station <hasWindSpeed> ?windSpeed .

    //     # Convertir la vitesse du vent en valeur numérique
    //     BIND(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", "")) AS ?windSpeedValue)

    //     # Ignorer les valeurs nulles ou égales à zéro
    //     FILTER(?windSpeedValue > 0)
    //     BIND(?windSpeedValue AS ?nonZeroWindSpeed)

    //     # Filtrer pour la station spécifique
    //     FILTER(?station = <http://meteo.com/Station#${stationId}>)
    // }
    // GROUP BY ?station
    const query = `

    BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?avgWindSpeed)
       (MAX(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) AS ?maxWindSpeed)
       (MIN(?nonZeroWindSpeed) AS ?minWindSpeed)
       (IF(AVG(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) > 15, "Fort",
           IF(AVG(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", ""))) > 5, "Modéré",
           "Faible")) AS ?windComment)
WHERE {
    # Récupérer la station et la vitesse du vent
    ?station <hasWindSpeed> ?windSpeed .

    # Extraire la valeur numérique de la vitesse du vent
    BIND(xsd:double(REPLACE(STR(?windSpeed), "http://meteo.com/", "")) AS ?windSpeedValue)

    # Ignorer les valeurs nulles ou égales à zéro pour le calcul du min
    FILTER(?windSpeedValue > 0)
    BIND(?windSpeedValue AS ?nonZeroWindSpeed)
 FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station
  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log(response.results.bindings.length>0);

        return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].minWindSpeed.value):-1;
      })
    );
  }

  getAverageWindDirection(stationId: string): Observable<any> {
    const query = `
    BASE <http://meteo.com/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?station
           (AVG(xsd:double(STR(?dirWind))) AS ?averageWindDirection)
           (IF(AVG(xsd:double(STR(?dirWind))) >= 348 || AVG(xsd:double(STR(?dirWind))) < 11, "Nord",
               IF(AVG(xsd:double(STR(?dirWind))) >= 11 && AVG(xsd:double(STR(?dirWind))) < 34, "Nord-Nord-Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 34 && AVG(xsd:double(STR(?dirWind))) < 56, "Nord-Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 56 && AVG(xsd:double(STR(?dirWind))) < 79, "Est-Nord-Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 79 && AVG(xsd:double(STR(?dirWind))) < 101, "Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 101 && AVG(xsd:double(STR(?dirWind))) < 124, "Est-Sud-Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 124 && AVG(xsd:double(STR(?dirWind))) < 146, "Sud-Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 146 && AVG(xsd:double(STR(?dirWind))) < 169, "Sud-Sud-Est",
               IF(AVG(xsd:double(STR(?dirWind))) >= 169 && AVG(xsd:double(STR(?dirWind))) < 191, "Sud",
               IF(AVG(xsd:double(STR(?dirWind))) >= 191 && AVG(xsd:double(STR(?dirWind))) < 214, "Sud-Sud-Ouest",
               IF(AVG(xsd:double(STR(?dirWind))) >= 214 && AVG(xsd:double(STR(?dirWind))) < 236, "Sud-Ouest",
               IF(AVG(xsd:double(STR(?dirWind))) >= 236 && AVG(xsd:double(STR(?dirWind))) < 259, "Ouest-Sud-Ouest",
               IF(AVG(xsd:double(STR(?dirWind))) >= 259 && AVG(xsd:double(STR(?dirWind))) < 281, "Ouest",
               IF(AVG(xsd:double(STR(?dirWind))) >= 281 && AVG(xsd:double(STR(?dirWind))) < 304, "Ouest-Nord-Ouest",
               IF(AVG(xsd:double(STR(?dirWind))) >= 304 && AVG(xsd:double(STR(?dirWind))) < 326, "Nord-Ouest",
               "Nord-Nord-Ouest"
               ))))))))))))))) AS ?averageWindDirectionText)
    WHERE {
        ?station <hasDirWind> ?dirWind .
        FILTER(?station = <http://meteo.com/Station#${stationId}>)
    }
    GROUP BY ?station
  `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      'Accept': 'application/json',
    });

    return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
      map((response: any) => {
        console.log(response.results.bindings.length>0);

        return response.results.bindings.length>0 ? response.results.bindings[0].averageWindDirectionText.value:-1;
      })
    );
  }
  getAverageCloudiness(stationId:string) : Observable<any>{
    const query=`
    BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:float(REPLACE(STR(?cloudiness), "http://meteo.com/", ""))) AS ?avgCloudiness)
WHERE {
    # Récupérer la nébulosité
    ?station <hasCloudiness> ?cloudiness .

    # Exclure les valeurs manquantes ou invalides
    FILTER(STR(?cloudiness) != "")
    FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station

`;
const headers = new HttpHeaders({
  'Content-Type': 'application/sparql-query',
  'Accept': 'application/json',
});

return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
  map((response: any) => {
    console.log(response.results.bindings.length>0);

    return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].avgCloudiness.value):-1;
  }
));
  }
  getAverageGust(stationId: string): Observable<any> {
  const query= ` 
  BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:float(REPLACE(STR(?gust), "http://meteo.com/", ""))) AS ?avgGust)
WHERE {
    # Récupérer les rafales
    ?station <hasGust> ?gust .

    # Exclure les valeurs manquantes ou invalides
    FILTER(STR(?gust) != "" && STR(?gust) != "mq")
	FILTER(?station = <http://meteo.com/Station#${stationId}>)
}
GROUP BY ?station
ORDER BY ?station

`;
const headers = new HttpHeaders({
  'Content-Type': 'application/sparql-query',
  'Accept': 'application/json',
});

return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
  map((response: any) => {
    console.log(response.results.bindings.length>0);

    return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].avgGust.value):-1;
  }
));
}
getSoilStatus(stationId: string): Observable<any> {
  const query = `BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:float(REPLACE(STR(?soilState), "http://meteo.com/", ""))) AS ?avgSoilState)
WHERE {
    # Récupérer les états du sol
    ?station <hasSoilState> ?soilState .

    # Exclure les valeurs manquantes ou invalides
    FILTER(STR(?soilState) != "" && STR(?soilState) != "mq")
    FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station
`;

const headers = new HttpHeaders({
  'Content-Type': 'application/sparql-query',
  'Accept': 'application/json',
});

return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
  map((response: any) => {
    console.log(response.results.bindings.length>0);
    return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].avgSoilState.value):-1;
  })
)
}
getPrecipitations(stationId: string): Observable<any> {
  const query = `BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:float(REPLACE(STR(?precipitations), "http://meteo.com/", ""))) AS ?avgPrecipitations)
       (MAX(xsd:float(REPLACE(STR(?precipitations), "http://meteo.com/", ""))) AS ?maxPrecipitations)
       (MIN(xsd:float(REPLACE(STR(?precipitations), "http://meteo.com/", ""))) AS ?minPrecipitations)
WHERE {
    # Récupérer les précipitations
    ?station <hasPrecipitations> ?precipitations .

    # Exclure les valeurs manquantes ou invalides
    FILTER(STR(?precipitations) != "" && STR(?precipitations) != "mq")

    # Ignorer les valeurs négatives
    BIND(xsd:float(REPLACE(STR(?precipitations), "http://meteo.com/", "")) AS ?precipitationValue)
    FILTER(?precipitationValue >= 0)
 FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station
`;

const headers = new HttpHeaders({
  'Content-Type': 'application/sparql-query',
  'Accept': 'application/json',
});

return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
  map((response: any) => {
    console.log(response.results.bindings.length>0);
    return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].avgPrecipitations.value):-1;
  })
);
}
getSnowHeight(stationId: string): Observable<any> {
  const query = `
  BASE <http://meteo.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?station 
       (AVG(xsd:float(REPLACE(STR(?snowHeight), "http://meteo.com/", ""))) AS ?avgSnowHeight)
WHERE {
    # Récupérer les hauteurs de neige
    ?station <hasSnowHeight> ?snowHeight .

    # Exclure les valeurs manquantes ou invalides
    FILTER(STR(?snowHeight) != "" && STR(?snowHeight) != "mq")
 FILTER(?station = <http://meteo.com/Station#${stationId}>)

}
GROUP BY ?station
ORDER BY ?station
`;

const headers = new HttpHeaders({
  'Content-Type': 'application/sparql-query',
  'Accept': 'application/json',
});

return this.http.post(this.graphDBEndpoint, query, { headers }).pipe(
  map((response: any) => {
    console.log(response.results.bindings.length>0);
    return response.results.bindings.length>0 ? parseFloat(response.results.bindings[0].avgSnowHeight.value):-1;
  }
));
}





}
