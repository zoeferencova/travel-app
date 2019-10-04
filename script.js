const foursquareId = '5S4DIWE5USNCY0HOPLLXFZGYUI1QDCBZVSZ3EQECIZTPWCDA';
const foursquareKey = '45DSDFCFOGXPP51N4BXWFMB3LHCSMQYYZFBIO1UBT5LMNQTD';
const foursquareVersion = '20180323'
const foursquareSearchURL = 'https://api.foursquare.com/v2/venues/'

const newsKey = '5ea9e10fbd6545338beb1c8f81941f00'

function formatQuery(params) {
	const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
	return queryItems.join('&')
} 


//generate foursquare information
function searchFoursquare(query, near) {
	const endpoint = 'search'
	const params = {
		client_id: foursquareId,
		client_secret: foursquareKey,
		v: foursquareVersion,
		near,
		query,
		limit: 1
	}
	const url = `${foursquareSearchURL}${endpoint}?${formatQuery(params)}`
	fetch(url)
		.then(response => response.json())
		.then(responseJson => getAllDetails(responseJson))
}

function getAllDetails(response) {
	for (i=0; i < response.response.venues.length; i++)  {
		const venueId = response.response.venues[i].id;
		getLocationDetails(response, venueId)

	}
}

function getLocationDetails(response, venueId) {
	const params = {
		client_id: id,
		client_secret: key,
		v: version,
	}
	const url = `${foursquareSearchURL}${venueId}?${formatQuery(params)}`
	fetch(url)
		.then(response => response.json())
		.then(responseJson => console.log(responseJson))
}

function getPhoto(response) {
	if (response.response.venue.bestPhoto === undefined) {
		$('#main').prepend('')
	} else {
		const imagePrefix = response.response.venue.bestPhoto.prefix
		const imageSuffix = response.response.venue.bestPhoto.suffix
		const imageUrl =`${imagePrefix}200x300${imageSuffix}`
		$('#main').prepend(`<img src="${imageUrl}">`)
	}
}

// $(searchFoursquare())

//generate wikipedia information
function searchWiki(query) {
	const params = {
	  origin: '*',
	  action: 'query',
	  format: 'json',
	  prop: 'extracts|pageimages',
	  indexpageids: 1,
	  redirects: 1, 
	  exchars: 1500,
	  exsectionformat: 'plain',
	  piprop: 'name|thumbnail|original',
	  pithumbsize: 250,
	  titles: query
	};

	const searchURL = 'https://en.wikipedia.org/w/api.php';
	const url = `${searchURL}?${formatQuery(params)}`
	fetch(url)
		.then(response => response.json())
		.then(responseJson => showInfo(responseJson))
}

function showInfo(response) {
	const pageId = Number(response.query.pageids[0])
	const title = response.query.pages[pageId].title
	const extract = response.query.pages[pageId].extract
	$('#main').html(extract).prepend(title)
}

// $(searchWiki('korea'))

//generate news information
function searchNews(query)  {
	const params = {
		apiKey: newsKey,
		q: query,
		pageSize: 4,
		language: 'en',
		sortBy: 'relevancy'
	}

	const searchURL = 'https://newsapi.org/v2/everything'
	const url = `${searchURL}?${formatQuery(params)}`
	fetch(url)
		.then(response => response.json())
		.then(responseJson => showNews(responseJson))
}

function showNews(response) {
	console.log(response)
	const title = response.articles[0].title
	const description = response.articles[0].description
	const image = response.articles[0].urlToImage
	$('#main').html(description).prepend(title).prepend(`<img height=100px src=${image}>`)
}

// $(searchNews('chicago restaurants'))  //make first part of query the city, second part the category chosen


//create map
function createMap(query) {
	$('.button').on('click', function() {
		$('#map').append(`<iframe
		  width="600"
		  height="450"
		  frameborder="0" style="border:0"
		  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAneTY3_ApOO16hFLSvUESlvJAmiISfJ_c
		    &q=${query}" allowfullscreen>
		</iframe>`)
	})
}

// $(createMap('midtown chopt'))



