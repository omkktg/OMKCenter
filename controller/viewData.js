angular.module('formApp', [])
    .controller('ViewDataController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {

    const name = 'Georgia Sugisandhea';
    $scope.waiting = true;
    
    $http.get('https://script.google.com/macros/s/AKfycbwk3iGg8luuMUahGj-GdwP3bZVmntvS_Snh5Hk0M1-3UAKzfoptPjUS7K1fdteBvwQFeg/exec')
    .then(function(res){
            const data = res.data;
            console.log(data);

            $scope.bookings = [];

            data.forEach(entry => {
                if(entry.nama === name){
                    console.log(entry);
                    entry.tanggal = new Date(entry.tanggal);
                    entry.tanggal = entry.tanggal.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    console.log(entry.tanggal);
                    $scope.bookings.push(entry);
                }
            })

            $scope.waiting = false;
        })
    }
]);