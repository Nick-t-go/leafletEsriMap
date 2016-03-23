'user strict';

app.factory('Auth', function($http){
    return{
    	authenticate: function(user){
    		var credentials = { username: user.name, password: user.password}
        return $http.post('https://fs-gdb10:6443/arcgis/tokens/' + credentials)
            .then(function(results){
                return results.data;
            })
        }
    }
})
