****WeatherAppWithAngular****
****Description****
Ce projet est une application météo développée avec Angular. Elle utilise Bootstrap pour le design et GraphDB pour exécuter les requêtes et récupérer les réponses.
Le projet inclut un endpoint nommé /test2 conformément au dépôt test2. dans le projet sous services : le service GraphdbService contient la variable : graphDBEndpoint= '/test2'.
test2 correspond bien au nom de mon dépot sur graphDB, vous le changez en l'adaptant avec le nom de votre dépot.


****Prérequis****
Avant de commencer, assurez-vous que les outils suivants sont installés :

**Node.js (v16.x ou plus récent) : Télécharger Node.js**
**npm (livré avec Node.js) ou yarn**
**Angular CLI : Installez-le globalement en exécutant :**
sur bash
npm install -g @angular/cli

GraphDB : Assurez-vous d'avoir accès à une instance fonctionnelle de GraphDB et ses informations de connexion.
voici le lien pour installer graphDB : https://www.ontotext.com/products/ontotext-refine/

****Installation****

**1. Cloner le dépôt**
Clonez le projet depuis GitHub :

sur bash
git clone https://github.com/nawalchahboune/WeatherAppWithAngular.git
cd WeatherAppWithAngular

**2. Installer les dépendances**
Installez les dépendances nécessaires pour le projet :

sur bash
npm install
**3. Installer Bootstrap**
Bootstrap est déjà inclus dans les dépendances du projet. Si ce n'est pas le cas, installez-le en exécutant :

sur bash
npm install bootstrap
Ensuite, ajoutez Bootstrap dans le fichier angular.json :

"styles": [
    "src/styles.css",
    "node_modules/bootstrap/dist/css/bootstrap.min.css"
],
"scripts": [
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]


après exécuter le projet avec les commandes : 
  -**ng serve
  -npm start**


