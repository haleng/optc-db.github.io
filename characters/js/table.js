(function() {

angular.module('optc') .run(function($rootScope, $timeout, $storage, MATCHER_IDS) {

    /**************
     * Table data *
     **************/

    var additionalColumns = $storage.get('charColumns', [ ]);

    var padding = Math.floor(Math.log(window.units.length+2) / Math.log(10)) + 1;
    var table = null;

    var addImage = function(data, type, row, meta) {
        return '<img class="slot small" data-original="' + Utils.getThumbnailUrl(row[0]) + '"> ' +
            //return '<img class="slot small" data-original="' + Utils.getGlobalThumbnailUrl(row[0]) + '" onerror="this.onerror=null;this.src=\'' + Utils.getThumbnailUrl(row[0]) + '\';"> ' +
            '<a ui-sref="main.search.view({ id: ' + parseInt(row[0],10) + '})">' + data + '</a>';
    };

    var fuse = new Fuse(window.units, {
        keys: [ 'name' ],
        id: 'number',
        threshold: 0.3,
        distance: 200
    });

    var fused = null;

    var tableData = null;
    var farmableLocations = null;

    var log = $storage.get('characterLog', [ ]);
    var characterLog = { };
    for (var i=0;i<log.length;++i) characterLog[log[i]] = true;
    
    // var list_koreaTM_kizaru = [603, 649, 654, 836, 852, 865, 1003, 1242, 1397, 1399, 1527, 1690, 1707, 1725, 1766, 1772, 1808, 1818, 1853, 1889, 1916, 1930, 1931, 1932, 1933, 1941, 1943, 1972, 1976, 1985, 1995, 1997, 2000, 2007, 2013, 2015, 2017, 2019, 2021, 2023, 2025, 2027, 2029, 2031, 2034, 2035, 2037, 2039, 2041, 2043, 2044, 2045, 2046, 2048, 2050, 2060, 2062, 2251];
	// var list_koreaTM_bigmam = [603, 806, 833, 951, 1001, 1049, 1163, 1167, 1169, 1171, 1511, 1512, 1573, 1581, 1582, 1588, 1623, 1662, 1670, 1671, 1684, 1696, 1753, 1808, 1842, 1853, 1879, 1889, 1897, 1916, 1920, 1930, 1941, 1953, 1961, 1963, 1972, 1976, 2000, 2015, 2017, 2033, 2056, 2057, 2058, 2064, 2065, 2066, 2072, 2073, 2074, 2075, 2076, 2078, 2080, 2082, 2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090, 2091, 2099, 2101, 2103, 2105, 2107, 2111, 2401, 2403, 2405, 2408, 2505];
	// var list_koreaTM_crocodile = [396, 863, 1037, 1079, 1298, 1360, 1413, 1461, 1489, 1518, 1527, 1547, 1584, 1597, 1610, 1667, 1702, 1735, 1764, 1766, 1774, 1808, 1853, 1855, 1889, 1908, 1910, 1916, 1918, 1941, 1943, 1947, 1972, 1976, 1980, 1982, 2000, 2015, 2017, 2019, 2023, 2033, 2064, 2068, 2070, 2074, 2076, 2091, 2092, 2093, 2094, 2095, 2097, 2099, 2109, 2111, 2113, 2115, 2117, 2119, 2121, 2123, 2127, 2128, 2131, 2132, 2133, 2134, 2135, 2138, 2139, 2140, 2141, 2142, 2158, 2163];
	// var list_koreaTM_jack = [516, 578, 681, 683, 685, 797, 836, 929, 1089, 1095, 1112, 1287, 1357, 1401, 1432, 1553, 1595, 1608, 1623, 1652, 1671, 1671, 1690, 1715, 1727, 1780, 1808, 1830, 1842, 1853, 1865, 1867, 1889, 1893, 1916, 1933, 1941, 1972, 2000, 2017, 2019, 2046, 2064, 2066, 2070, 2099, 2109, 2113, 2123, 2136, 2138, 2139, 2140, 2141, 2142, 2144, 2146, 2148, 2150, 2152, 2154, 2156, 2158, 2159, 2163, 2165, 2167, 2168, 2169, 2170, 2171, 2172, 2173, 2215];
	// var list_koreaTM_enel = [575, 603, 713, 797, 946, 1072, 1095, 1097, 1108, 1138, 1141, 1143, 1215, 1254, 1384, 1397, 1469, 1504, 1593, 1682, 1684, 1686, 1688, 1696, 1753, 1755, 1757, 1759, 1761, 1808, 1853, 1879, 1889, 1899, 1916, 1941, 1972, 1985, 1995, 2000, 2046, 2064, 2070, 2074, 2087, 2091, 2097, 2099, 2109, 2113, 2163, 2126, 2137, 2144, 2148, 2175, 2177, 2181, 2183, 2185, 2187, 2189, 2193, 2194, 2195, 2197, 2199, 2200, 2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2215, 2217, 2232, 2410, 2412, 2414, 2507, 2513];
    // var list_koreaTM_shanks = [420, 779, 866, 882, 897, 947, 978, 979, 983, 1087, 1108, 1203, 1242, 1268, 1298, 1302, 1332, 1426, 1509, 1595, 1649, 1696, 1735, 1792, 1808, 1810, 1815, 1816, 1853, 1861, 1881, 1889, 1891, 1916, 1941, 1945, 1965, 1972, 1978, 2000, 2015, 2021, 2037, 2064, 2097, 2109, 2127, 2137, 2148, 2163, 2175, 2181, 2193, 2195, 2197, 2201, 2211, 2219, 2232, 2234, 2236, 2238, 2240, 2242, 2244, 2247, 2249, 2251, 2253, 2254, 2256, 2257, 2258, 2259, 2500];
    // var list_koreaTM_hancock = [392, 405, 516, 603, 808, 836, 918, 1047, 1163, 1287, 1289, 1294, 1300, 1306, 1312, 1326, 1328, 1374, 1416, 1450, 1518, 1555, 1581, 1582, 1593, 1624, 1625, 1626, 1670, 1671, 1723, 1725, 1808, 1818, 1830, 1847, 1853, 1863, 1889, 1916, 1918, 1920, 1922, 1941, 1943, 1947, 1949, 1972, 1982, 2000, 2033, 2056, 2057, 2058, 2064, 2109, 2137, 2158, 2165, 2167, 2175, 2197, 2201, 2211, 2236, 2245, 2249, 2251, 2261, 2263, 2265, 2267, 2269, 2271, 2273, 2275, 2277, 2281, 2283, 2285, 2290, 2292, 2295, 2296, 2297, 2300, 2407, 2408, 2441, 2500];
    // var list_koreaTM_law = [516, 518, 722, 724, 761, 762, 763, 764, 765, 766, 767, 768, 769, 777, 852, 865, 901, 924, 1003, 1037, 1039, 1143, 1220, 1222, 1302, 1304, 1376, 1401, 1432, 1466, 1467, 1489, 1491, 1513, 1514, 1607, 1624, 1649, 1650, 1690, 1696, 1735, 1737, 1808, 1830, 1853, 1861, 1889, 1891, 1893, 1897, 1916, 1941, 1947, 1972, 1980, 1995, 2000, 2015, 2044, 2045, 2046, 2064, 2097, 2099, 2109, 2111, 2113, 2137, 2158, 2175, 2193, 2201, 2211, 2236, 2245, 2251, 2261, 2265, 2281, 2283, 2287, 2290, 2294, 2299, 2300, 2302, 2304, 2306, 2308, 2310, 2321, 2323, 2325, 2327, 2329, 2330, 2331, 2332, 2333, 2334, 2336, 2500, 3340, 3352, 3354];
    // var list_koreaTM_kaidou = [405, 575, 677, 752, 831, 852, 865, 882, 951, 978, 1004, 1018, 1043, 1047, 1141, 1292, 1298, 1328, 1374, 1387, 1388, 1389, 1397, 1399, 1422, 1446, 1447, 1448, 1467, 1514, 1520, 1549, 1550, 1551, 1602, 1808, 1815, 1818, 1853, 1865, 1867, 1879, 1889, 1897, 1916, 1924, 1941, 1972, 1978, 2000, 2015, 2064, 2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2097, 2109, 2123, 2137, 2152, 2175, 2177, 2193, 2197, 2211, 2242, 2249, 2253, 2254, 2261, 2263, 2265, 2277, 2281, 2290, 2299, 2302, 2330, 2330, 2332, 2334, 2336, 2363, 2365, 2367, 2369, 2371, 2372, 2373, 2375, 2377, 2379, 2382, 2383, 2384, 2385, 2387, 2441, 2500, 2576, 2577, 3346, 3348, 3350];
    // var list_koreaTM_nami = [268, 572, 575, 603, 777, 804, 865, 870, 918, 978, 1041, 1047, 1123, 1251, 1258, 1287, 1298, 1357, 1359, 1380, 1456, 1518, 1522, 1530, 1547, 1602, 1619, 1680, 1694, 1733, 1735, 1766, 1774, 1776, 1808, 1810, 1812, 1815, 1846, 1853, 1879, 1889, 1916, 1924, 1941, 1943, 1945, 1972, 2000, 2015, 2033, 2035, 2037, 2064, 2097, 2109, 2137, 2163, 2175, 2197, 2211, 2219, 2261, 2263, 2299, 2302, 2323, 2330, 2336, 2338, 2340, 2342, 2344, 2346, 2347, 2349, 2350, 2351, 2354, 2356, 2357, 2358, 2359, 2360, 2362, 2365, 2383, 2384, 2385, 2387, 2410, 2412, 2414, 2433, 2577, 2585, 2587, 3346, 3355];
    // var list_koreaTM_omoody = [681, 683, 685, 804, 885, 978, 1016, 1199, 1201, 1251, 1380, 1432, 1463, 1465, 1508, 1516, 1518, 1530, 1595, 1709, 1711, 1733, 1808, 1815, 1846, 1853, 1889, 1916, 1941, 1972, 2000, 2015, 2064, 2089, 2093, 2109, 2111, 2123, 2137, 2148, 2158, 2163, 2175, 2177, 2191, 2211, 2213, 2215, 2217, 2219, 2236, 2261, 2281, 2283, 2287, 2290, 2299, 2306, 2336, 2336, 2338, 2347, 2354, 2358, 2359, 2360, 2362, 2363, 2365, 2369, 2375, 2381, 2387, 2410, 2412, 2414, 2441, 2446, 2447, 2448, 2449, 2450, 2451, 2452, 2453, 2454, 2463, 2464, 2465, 2466, 2467, 2469, 2471, 2585, 2587, 2631, 3352, 3354, 3357, 3359, 3361];
    var list_koreaTM_doffy = [575, 603, 743, 870, 884, 903, 1037, 1127, 1141, 1232, 1245, 1247, 1298, 1422, 1432, 1450, 1452, 1456, 1487, 1553, 1584, 1593, 1628, 1766, 1774, 1792, 1800, 1808, 1816, 1830, 1853, 1869, 1877, 1879, 1889, 1916, 1921, 1941, 1943, 1945, 1947, 1949, 1972, 2000, 2001, 2015, 2033, 2056, 2057, 2058, 2064, 2097, 2109, 2137, 2158, 2163, 2165, 2167, 2175, 2197, 2211, 2219, 2261, 2281, 2299, 2323, 2327, 2336, 2338, 2356, 2362, 2363, 2365, 2375, 2381, 2387, 2394, 2398, 2416, 2418, 2420, 2422, 2424, 2426, 2428, 2429, 2431, 2433, 2435, 2436, 2437, 2438, 2439, 2441, 2443, 2444, 2446, 2465, 2466, 2467, 2469, 2487, 2529, 2530, 2686, 3348, 3350, 3363, 3365, 3368];
    var list_koreaTM_weevil = [353, 645, 836, 1041, 1163, 1184, 1186, 1190, 1304, 1310, 1374, 1401, 1487, 1525, 1528, 1595, 1602, 1623, 1669, 1680, 1694, 1727, 1739, 1745, 1772, 1774, 1808, 1810, 1816, 1826, 1842, 1853, 1879, 1889, 1897, 1916, 1930, 1941, 1943, 1965, 1966, 1972, 1982, 1995, 1997, 2000, 2044, 2045, 2064, 2070, 2097, 2109, 2137, 2144, 2158, 2175, 2181, 2193, 2197, 2211, 2236, 2261, 2281, 2290, 2299, 2323, 2330, 2336, 2362, 2375, 2387, 2398, 2416, 2418, 2428, 2429, 2431, 2437, 2438, 2441, 2443, 2446, 2457, 2458, 2459, 2460, 2461, 2465, 2469, 2471, 2473, 2475, 2477, 2479, 2481, 2483, 2485, 2487, 2489, 2491, 2496, 2498, 2499, 2500, 2501, 2502, 2504, 2505, 2506, 2507, 2508, 2510, 2512, 2513, 2597, 3369];
    /*******************
     * Table functions *
     *******************/

    var getTableColumns = function() {
        var result = [
            { title: 'ID' },
            { title: 'Name', render: addImage },
            { title: 'Type' },
            { title: 'Class' },
            { title: 'HP' },
            { title: 'ATK' },
            { title: 'RCV' },
            { title: 'Cost' },
            { title: 'Slots' },
            { title: 'Stars' },
            { title: 'CL', orderable: false }
        ];
        additionalColumns.forEach(function(x) {
            var title = x
                .replace(/Minimum cooldown/,'Min CD')
                .replace(/Minimum Limit Break cooldown/,'Min LB CD')
                .replace(/Initial cooldown/,'Init. CD')
                .replace(/Initial Limit Break cooldown/,'Init. LB CD')
                .replace(/MAX EXP/,'MAX EXP');
            result.splice(result.length-1, 0, { title: title, type: 'num-string' });
        });
        return result;
    };

    /*******************
     * Table filtering *
     *******************/

    var tableFilter = function(settings, data, index) {
        if (!tableData.parameters) return true;
        var id = parseInt(data[0],10), unit = window.units[id - 1];
        var flags = window.flags[unit.number + 1] || { };
        var farmableSocket = CharUtils.hasFarmableSocket(unit.number);
        
        /* * * * * Query filters * * * * */
        // filter by matchers
        for (var matcher in tableData.parameters.matchers) {
            if (!tableData.parameters.matchers[matcher].test(unit[matcher]))
                return false;
        }
        // filter by ranges
        for (var range in tableData.parameters.ranges) {
            var stat, range_ = range.toLowerCase();
            if (range == 'id')
                stat = unit.number + 1;
            else if (range_ == 'mincd' || range_ == 'maxcd') {
                stat = window.cooldowns[unit.number];
                if (stat) stat = stat[range_ == 'mincd' ? 0 : 1];
            } else
                stat = unit[range] || unit[range.toLowerCase()] || unit['max' + range.toUpperCase()];
            if (stat === null || stat === undefined ||
                    stat < tableData.parameters.ranges[range][0] || stat > tableData.parameters.ranges[range][1])
                return false;
        }
        // filter by query
        if (tableData.parameters.query) {
            var name = Utils.getFullUnitName(id);
            if (!tableData.fuzzy && !tableData.parameters.query.test(name)) return false;
            if (tableData.fuzzy) {
                if (fused === null) fused = fuse.search(tableData.parameters.query.source || 'xyz');
                if (fused.indexOf(id - 1) == -1) return false;
            }
        }
        /* * * * * Sidebar filters * * * * */
        if (!tableData.parameters.filters) return true;
        var filters = tableData.parameters.filters;
        // filter by type
        //if (filters.type && unit.type !== filters.type) return false;
        if (filters.types && filters.types.length){
            if (!Array.isArray(unit.type)) if (!filters.types.includes(unit.type)) return false;
            if (Array.isArray(unit.type)) if ((!filters.types.includes(unit.type[0])) && (!filters.types.includes(unit.type[1]))) return false;
        }
        // filter by class
        if(!Array.isArray(unit.class) && filters.noSingleClass) return false;
        if (filters.classes && filters.classes.length) {
            var inclusive = !filters.classInclusive;
            var singleQuery = filters.classes.length == 1, singleClass = !Array.isArray(unit.class), doubleClass = Array.isArray(unit.class) && unit.class.length == 2, dualCharacter = Array.isArray(unit.class) && unit.class.length == 3;
            if(!inclusive){
                if (singleClass){
                    if(singleQuery) if(filters.classes[0] != unit.class) return false;
                    if(!singleQuery) if(!filters.classes.includes(unit.class)) return false;
                }
                else if(doubleClass){
                    if(singleQuery) return false;
                    if(!singleQuery) if(!filters.classes.includes(unit.class[0]) || !filters.classes.includes(unit.class[1])) return false;
                }
                else{
                    if(singleQuery) {
                        var temp1 = false;
                        var temp2 = false;
                        var temp3 = false;
                        if (unit.class[0].length != 2) { if(filters.classes[0] == unit.class[0]) temp1 = true;}
                        if (unit.class[1].length != 2) { if(filters.classes[0] == unit.class[1]) temp2 = true;}
                        if (unit.class[2].length != 2) { if(filters.classes[0] == unit.class[2]) temp3 = true;}
                        if (!(temp1 || temp2 || temp3)) return false;
                        
                    }
                    if(!singleQuery){
                        if((!filters.classes.includes(unit.class[0][0]) || !filters.classes.includes(unit.class[0][1]))
                          && (!filters.classes.includes(unit.class[1][0]) || !filters.classes.includes(unit.class[1][1]))
                          && (!filters.classes.includes(unit.class[2][0]) || !filters.classes.includes(unit.class[2][1]))) return false;
                    }
                }
            }
            else{
                if (singleClass) if(!filters.classes.includes(unit.class)) return false;
                if (doubleClass) if(!filters.classes.includes(unit.class[0]) && !filters.classes.includes(unit.class[1])) return false;
                if (dualCharacter) {
                    var uclasses = [];
                    for(i = 0; i < unit.class.length; i++) { uclasses.push(unit.class[i][0]); uclasses.push(unit.class[i][1]); }
                    var temp = false;
                    for(i = 0; i < uclasses.length; i++) if(temp || filters.classes.includes(uclasses[i])) temp = true;
                    if(!temp) return false;
                }
            }
        }
        // filter by stars
        if (filters.stars && filters.stars.length && filters.stars.indexOf(unit.stars) == -1) return false;
        // filter by cost
        if (filters.costEnabled && (unit.cost < filters.cost[0] || unit.cost > filters.cost[1])) return false;
        // filter by drop
        if (filters.drop) {
            var isFarmable = CharUtils.isFarmable(id);
            if (filters.drop == 'Farmable') {
                if (id == 1 || !isFarmable) return false;
                if (farmableLocations !== null) {
                    var farmable = CharUtils.checkFarmable(id, farmableLocations);
                    if (!farmable) return false;
                }
            } else if (filters.drop != 'Farmable') {
                if (id != 1 && isFarmable) return false; 
                if (filters.nonFarmable) {
                    // RR
                    if (filters.nonFarmable.rro && !flags.rro) return false;
                    if (filters.nonFarmable.rro === false && flags.rro) return false;
                    // limited RR
                    if (filters.nonFarmable.lrr && !flags.lrr) return false;
                    if (filters.nonFarmable.lrr === false && flags.lrr) return false;
                    // promo
                    if (filters.nonFarmable.promo && !flags.promo) return false;
                    if (filters.nonFarmable.promo === false && flags.promo) return false;
                    // special
                    if (filters.nonFarmable.special && !flags.special) return false;
                    if (filters.nonFarmable.special === false && flags.special) return false;
                    // rayleigh shop
                    if (filters.nonFarmable.shop && !flags.shop) return false;
                    if (filters.nonFarmable.shop === false && flags.shop) return false;
                    // trade port
                    if (filters.nonFarmable.tmshop && !flags.tmshop) return false;
                    if (filters.nonFarmable.tmshop === false && flags.tmshop) return false;
                    // TM RR
                    if (filters.nonFarmable.tmlrr && !flags.tmlrr) return false;
                    if (filters.nonFarmable.tmlrr === false && flags.tmlrr) return false;
                }
            }
        }
        // exclusion filters
        if (filters.noBase && (evolutions[id] && evolutions[id].evolution)) return false;
        if (filters.noEvos && Utils.isEvolverBooster(unit)) return false;
        //console.log(window.details[id] ? "limit" in window.details[id] ? id : "no" : "no details");
        if (filters.noLB && window.details[id]) if("limit" in window.details[id]) return false;


		// korea tm filter
        // if (filters.koreaTM_kizaru && list_koreaTM_kizaru.indexOf(id) == -1) return false;
        // if (filters.koreaTM_bigmam && list_koreaTM_bigmam.indexOf(id) == -1) return false;
		// if (filters.koreaTM_crocodile && list_koreaTM_crocodile.indexOf(id) == -1) return false;
		// if (filters.list_koreaTM_jack && list_koreaTM_jack.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_enel && list_koreaTM_enel.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_shanks && list_koreaTM_shanks.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_hancock && list_koreaTM_hancock.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_law && list_koreaTM_law.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_kaidou && list_koreaTM_kaidou.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_nami && list_koreaTM_nami.indexOf(id) == -1) return false;
        // if (filters.list_koreaTM_omoody && list_koreaTM_omoody.indexOf(id) == -1) return false;
        if (filters.list_koreaTM_doffy && list_koreaTM_doffy.indexOf(id) == -1) return false;
        if (filters.list_koreaTM_weevil && list_koreaTM_weevil.indexOf(id) == -1) return false;

		// koera end
        //=====================================

        if (filters.noSupport && window.details[id]) if("support" in window.details[id]) return false;
        if (filters.globalTM && [ 2555, 2554, 2553, 2548, 2546, 1387, 1388, 1389, 1446, 1447, 1448, 1549, 1550, 1551, 2534, 2536, 2538, 2540, 2542, 2544, 2550, 2517, 2557, 3370, 5086, 5087, 5088, 5089, 5093, 5094, 5095, 5100, 5101, 5102, 5103, 5108, 5109, 5110, 5111, 5116, 5117, 5118, 5119, 5124, 5125, 5126, 5127, 5132, 5133, 5134, 5135, 5140, 5141, 5142, 5143, 5070, 5071, 5072, 5073, 2510, 2515, 2532, 5078, 5079, 5080, 5081, 2527, 2526, 2525, 2524, 2523, 2522, 2521, 2520, 2519, 2508, 2507, 2506, 2477, 2475, 1985, 2181, 2418, 2446, 5008, 5009, 5010, 5011, 5020, 5021, 5022, 5023, 5040, 5041, 5042, 5043, 5055, 5056, 5057, 2465, 2265, 2251, 2035, 2025, 2023, 1747, 3342, 2552, 5048, 5049, 5050, 5051, 5032, 5033, 5034, 5035, 2504, 2398, 2356, 2263, 2197, 2158, 2097, 1924, 1518, 1298, 978, 933, 575, 418, 353, 227, 2529, 2489, 2471, 2375, 2323, 2193, 1978, 1945, 1828, 1792, 1602, 2416, 1553, 2290, 1897, 1338, 2457, 2428, 2177, 2167, 2165, 2046, 2045, 2021, 2019, 1867, 1865, 1581, 1256, 1254, 953, 2469, 2443, 2387, 2362, 2336, 2299, 2261, 2211, 2175, 2137, 2109, 2064, 2000, 1972, 1941, 1916, 1889, 1853, 1808, 1983, 2399, 5000, 5001, 5002, 5003, 5024, 5025, 5026, 5027, 5012, 5013, 5014, 5015, 5062, 5063, 5064, 5065, 2111, 2281, 2577, 5156, 5157, 5158, 5159 ].indexOf(id) == -1) return false;
        if (filters.japanTM && [ 2729, 2741, 2759, 2760, 2761, 2601, 2534, 2446, 5164, 5165, 5166, 5157, 5086, 5087, 5088, 5089, 5055, 5056, 5057, 2739, 2700, 2444, 2357, 2743, 2745, 2747, 2299, 2749, 2758, 2755, 2753, 2751, 2733, 2763, 2690, 2659, 2583, 2175, 2109, 1972, 1916, 1853, 1808, 2727, 2726, 2725, 2381, 2283, 1846, 1530, 1380, 1258, 2517, 2504, 2398, 1943, 1879, 1830, 1815, 1432, 1298, 795, 603, 5070, 5071, 5072, 5073, 2721, 2569, 2489, 2375, 2193, 1945, 1828, 1733, 1458, 1378, 2294, 2292, 1326, 1306, 1300, 1049, 1051, 1597, 2093, 2429, 2491, 2520 ].indexOf(id) == -1) return false;
        if (filters.worldClash && [ 253, 1041, 255, 257, 259, 979, 980, 983, 453, 455, 457, 946, 947, 948, 1182, 1528, 1186, 1188, 1190, 1270, 1509, 1510, 1511, 1606, 451, 981, 1184, 1272, 1512, 1607, 1222, 1276, 1278, 1602, 1608, 1700, 1798, 1989, 2037, 1047, 1492, 1972, 447, 1268, 575, 2025, 978, 2034, 1298, 2023, 1380, 2007, 1846, 1416, 1847, 2066, 408, 1927, 1345, 1593, 649, 1251, 1991, 1387, 2401, 2403, 2405 ].indexOf(id) == -1) return false;
        if (filters.swordOrdeal && [ 77, 255, 308, 449, 455, 530, 639, 645, 677, 750, 914, 1033, 1081, 1125, 1129, 1173, 1182, 1186, 1188, 1175, 1230, 1234, 1236, 1238, 1276, 1278, 1322, 1324, 1410, 1436, 1481, 1534, 1536, 1573, 1575, 1577, 1654, 1614, 1796, 1753, 1800, 1759, 1881, 2505, 1873, 1875, 1877, 1921, 1989, 2001, 2242, 2306, 2031, 2034, 2080, 2082, 2332, 2185, 2189, 2117, 2119, 2107, 2336, 2338, 2346, 2372, 2338, 2371, 2418, 2465, 2475, 2477, 2479, 2481, 2483, 2485, 2496, 2498 ].indexOf(id) == -1) return false;
        if (filters.faceoffAA && [ 3359, 1126, 3365, 3363, 595, 1298, 1314, 1192, 1280, 1283, 1665, 1669, 1713, 1826, 1849, 1764, 2023, 2025, 2405, 2039, 2041, 32, 77, 232, 263, 306, 459, 530, 860, 804, 978, 1054, 1085, 1100, 1225, 1228, 1240, 1281, 1282, 1316, 1318, 1380, 1416, 1590, 1595, 1707, 1778, 1780, 1784, 1846, 1847, 1869, 1926, 1991, 1993, 2007, 2019, 2027, 2029, 2031, 2034, 2043, 2064, 2187, 2251, 2261, 2283, 2347, 2552, 5032, 5033, 5034, 5035, 3340, 3342, 5048, 5049, 5050, 5051, 34, 44, 59, 68, 228, 229, 230, 265, 268, 297, 298, 299, 353, 355, 724, 770, 771, 772, 773, 774, 775, 783, 804, 806, 840, 974, 976, 1051, 1072, 1102, 1104, 1106, 1135, 1223, 1224, 1230, 1232, 1234, 1236, 1238, 1264, 1279, 1320, 1322, 1324, 1382, 1392, 1397, 1399, 1417, 1418, 1423, 1469, 1696, 1715, 1729, 2053, 2068, 1983, 5000, 5001, 5002, 5003, 2189, 2330, 2332, 2334, 2389 ].indexOf(id) == -1) return false;
        if (filters.typoClass){
            var allClass = [ "Fighter", "Slasher", "Striker", "Shooter", "Free Spirit", "Powerhouse", "Cerebral", "Driven", "Evolver", "Booster" ];
            if (unit.class.length == 3) if(allClass.indexOf(unit.class[0][0]) != -1 && allClass.indexOf(unit.class[0][1]) != -1 && allClass.indexOf(unit.class[1][0]) != -1 && allClass.indexOf(unit.class[1][1]) != -1 && allClass.indexOf(unit.class[2][0]) != -1 && allClass.indexOf(unit.class[2][1]) != -1) return false;
            if (unit.class.length == 2) if(allClass.indexOf(unit.class[0]) != -1 && allClass.indexOf(unit.class[1]) != -1) return false;
            if(allClass.indexOf(unit.class) != -1) return false;
        }
        if (filters.dualUnits){
            if (unit.type.length == 3 || unit.type == "Type") return false;
        }
        if (filters.luffyvkatakuri){
            var evolved = !(id in window.evolutions);
            var character = window.families[unit.number];
            if(character) if(character.length == 2) var matching = [ "Capone Bege", "Charlotte Linlin", "Carrot", "Jinbe", "Vinsmoke Judge", "Vito", "Gotti", "Charlotte Smoothie", "Charlotte Daifuku", "Tamago", "Charlotte Amande", "Caesar Clown", "Aladdin", "Charlotte Praline", "Charlotte Perospero", "Charlotte Pudding", "Bobbin", "Charlotte Opera", "Charlotte Chiffon", "Wadatsumi", "Charlotte Cracker", "Pekoms", "Charlotte Brûlée", "Charlotte Oven", "Pedro" ].indexOf(character[0]) != -1 || [ "Capone Bege", "Charlotte Linlin", "Carrot", "Jinbe", "Vinsmoke Judge", "Vito", "Gotti", "Charlotte Smoothie", "Charlotte Daifuku", "Tamago", "Charlotte Amande", "Caesar Clown", "Aladdin", "Charlotte Praline", "Charlotte Perospero", "Charlotte Pudding", "Bobbin", "Charlotte Opera", "Charlotte Chiffon", "Wadatsumi", "Charlotte Cracker", "Pekoms", "Charlotte Brûlée", "Charlotte Oven", "Pedro" ].indexOf(character[1]) != -1;
            else var matching = [ "Capone Bege", "Charlotte Linlin", "Carrot", "Jinbe", "Vinsmoke Judge", "Vito", "Gotti", "Charlotte Smoothie", "Charlotte Daifuku", "Tamago", "Charlotte Amande", "Caesar Clown", "Aladdin", "Charlotte Praline", "Charlotte Perospero", "Charlotte Pudding", "Bobbin", "Charlotte Opera", "Charlotte Chiffon", "Wadatsumi", "Charlotte Cracker", "Pekoms", "Charlotte Brûlée", "Charlotte Oven", "Pedro" ].indexOf(character) != -1;
            if(character) if(character.length == 2) var matching2 = [ "Charlotte Katakuri", "Charlotte Flampe", "Charlotte Mont-d'Or", "Streusen" ].indexOf(character[0]) != -1 || [ "Charlotte Katakuri", "Charlotte Flampe", "Charlotte Mont-d'Or", "Streusen" ].indexOf(character[1]) != -1;
            else var matching2 = [ "Charlotte Katakuri", "Charlotte Flampe", "Charlotte Mont-d'Or", "Streusen" ].indexOf(character) != -1;
            var criteria = unit.stars >= 4 && unit.maxLevel == 99;
            var specific = [ 2245, 2148, 1815, 2236, 2080, 2076, 2089, 2072, 2093, 2074, 2363, 2382 ].indexOf(id) != -1;
            if (!((matching2 && evolved) || (matching && criteria) || specific)) return false;
        }
        if (filters.doffyBlitz){
            var character = window.families[unit.number];
            var matching = [ "Monkey D. Luffy", "Roronoa Zoro", "Franky", "Nico Robin", "Usopp", "Trafalgar Law", "Bartolomeo", "Cavendish", "Rob Lucci", "Sabo", "Boa Sandersonia", "Boa Marigold", "Boa Hancock", "Marguerite", "Leo", "Don Sai", "Don Chinjao", "Ideo", "Blue Gilly", "Suleiman", "Mansherry", "Ricky", "Kyros", "Funk Brothers", "Hajrudin", "Abdullah and Jeet", "Orlumbus", "Elizabello", "Bepo", "Sabo", "Dagama", "Jesus Burgess", "Diamante" ].indexOf(character) != -1;
            var Katacount = 0;
            var Kataclass = [ "Slasher", "Striker", "Shooter", "Powerhouse" ];
            if (!Array.isArray(unit.class[0])){ for(var i = 0; i < Kataclass.length; i++) if(unit.class.indexOf(Kataclass[i]) != -1) Katacount++; }
            else for(var i = 0; i < Kataclass.length; i++) if(unit.class[2].indexOf(Kataclass[i]) != -1) Katacount++;
            if (Katacount !== 2) return false;
            else if (!matching) return false;
        }
        if (filters.franky){
          var Frankycount = 0;
          var Frankyclass = [ "Fighter", "Slasher", "Striker", "Shooter",];
          if (!Array.isArray(unit.class[0])) {
            for(var i = 0; i < Frankyclass.length; i++)
              if(unit.class.indexOf(Frankyclass[i]) != -1)
                Frankycount++;
          }
          else
            for(var i = 0; i < Frankyclass.length; i++)
              if(unit.class[2].indexOf(Frankyclass[i]) != -1)
                Frankycount++;
          if (Frankycount === 0) return false;
        }
        if (filters.katakuri){
            var Katacount = 0; var Katacount1 = 0; var Katacount2 = 0; var Katacount3 = 0;
            var Kataclass = [ "Fighter", "Striker", "Shooter", "Cerebral", "Powerhouse" ];
            if (!Array.isArray(unit.class[0])){ for(var i = 0; i < Kataclass.length; i++) if(unit.class.indexOf(Kataclass[i]) != -1) Katacount++; }
            else { 
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[0].indexOf(Kataclass[i]) != -1) { Katacount1++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[1].indexOf(Kataclass[i]) != -1) { Katacount2++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[2].indexOf(Kataclass[i]) != -1) { Katacount3++; }
            }
            if (Katacount !== 2 && Katacount1 !== 2 && Katacount2 !== 2 && Katacount3 !== 2) return false;
        }
        if (filters.katakuriplus){
            var Katacount = 0; var Katacount1 = 0; var Katacount2 = 0; var Katacount3 = 0;
            var Kataclass = [ "Slasher", "Striker", "Driven", "Cerebral", "Powerhouse" ];
            if (!Array.isArray(unit.class[0])){ for(var i = 0; i < Kataclass.length; i++) if(unit.class.indexOf(Kataclass[i]) != -1) Katacount++; }
            else { 
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[0].indexOf(Kataclass[i]) != -1) { Katacount1++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[1].indexOf(Kataclass[i]) != -1) { Katacount2++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[2].indexOf(Kataclass[i]) != -1) { Katacount3++; }
            }
            if (Katacount !== 2 && Katacount1 !== 2 && Katacount2 !== 2 && Katacount3 !== 2) return false;
        }
        if (filters.katakuriv2){
            var Katacount = 0; var Katacount1 = 0; var Katacount2 = 0; var Katacount3 = 0;
            var Kataclass = [ "Fighter", "Slasher", "Shooter", "Driven", "Powerhouse" ];
            if (!Array.isArray(unit.class[0])){ for(var i = 0; i < Kataclass.length; i++) if(unit.class.indexOf(Kataclass[i]) != -1) Katacount++; }
            else { 
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[0].indexOf(Kataclass[i]) != -1) { Katacount1++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[1].indexOf(Kataclass[i]) != -1) { Katacount2++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[2].indexOf(Kataclass[i]) != -1) { Katacount3++; }
            }
            if (Katacount !== 2 && Katacount1 !== 2 && Katacount2 !== 2 && Katacount3 !== 2) return false;
        }
        if (filters.TMlaw){
            var Katacount = 0; var Katacount1 = 0; var Katacount2 = 0; var Katacount3 = 0;
            var Kataclass = [ "Fighter", "Slasher", "Cerebral", "Free Spirit" ];
            if (!Array.isArray(unit.class[0])){ for(var i = 0; i < Kataclass.length; i++) if(unit.class.indexOf(Kataclass[i]) != -1) Katacount++; }
            else { 
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[0].indexOf(Kataclass[i]) != -1) { Katacount1++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[1].indexOf(Kataclass[i]) != -1) { Katacount2++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[2].indexOf(Kataclass[i]) != -1) { Katacount3++; }
            }
            if (Katacount !== 2 && Katacount1 !== 2 && Katacount2 !== 2 && Katacount3 !== 2) return false;
        }
        if (filters.sulongCarrot){
            var Katacount = 0; var Katacount1 = 0; var Katacount2 = 0; var Katacount3 = 0;
            var Kataclass = [ "Fighter", "Slasher", "Striker", "Shooter", "Cerebral" ];
            if (!Array.isArray(unit.class[0])){ for(var i = 0; i < Kataclass.length; i++) if(unit.class.indexOf(Kataclass[i]) != -1) Katacount++; }
            else { 
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[0].indexOf(Kataclass[i]) != -1) { Katacount1++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[1].indexOf(Kataclass[i]) != -1) { Katacount2++; }
                for(var i = 0; i < Kataclass.length; i++) if(unit.class[2].indexOf(Kataclass[i]) != -1) { Katacount3++; }
            }
            if (Katacount !== 2 && Katacount1 !== 2 && Katacount2 !== 2 && Katacount3 !== 2) return false;
        }
        if (filters.noFodder && Utils.isFodder(unit)) return false;
        if (filters.noFortnights && flags.fnonly) return false;
        if (filters.noRaids && flags.raid) return false;
        if (filters.noSpecials && (flags.lrr || flags.promo || flags.special || flags.shop )) return false;
        // filter by server
        if (filters.server) {
            if (filters.server == 'Global units' && !flags.global) return false;
            if (filters.server !== 'Global units' && flags.global) return false;
        }
        // filter by rr pool
        if ((filters.rr === 'Not in RR pool' && flags.rr) || (filters.rr === 'In RR pool' && !flags.rr)) return false;
        //filter by farmable Sockets
        if ((filters.socket === 'No Farmable Sockets' && farmableSocket) || (filters.socket === 'Farmable Sockets' && !farmableSocket)) return false;
        // filter by active matchers
        if (filters.custom.length > 0 && !window.details.hasOwnProperty(id)) return false;
        for (var i=0;i<filters.custom.length;++i) {
            if (!CharUtils.checkMatcher(filters.custom[i], id))
                return false;
        }
        // filter by character log
        if (filters.noLog && characterLog.hasOwnProperty(id)) return false;
        if (filters.noMissing && !characterLog.hasOwnProperty(id)) return false;
        // filter by orb controllers
        if ($rootScope.filters.custom[MATCHER_IDS['special.OrbControllers']] &&
                (tableData.parameters.filters.ctrlFrom || tableData.parameters.filters.ctrlTo)) {
            var orbData = CharUtils.getOrbControllerData(id);
            if (!orbData) return false;
            var from = tableData.parameters.filters.ctrlFrom || [ ], to = tableData.parameters.filters.ctrlTo || [ ];
            var mismatch = true;
            if (from.length && !to.length)
                mismatch = from.some(function(x) { return !orbData.from.hasOwnProperty(x); });
            else if (!from.length && to.length)
                mismatch = to.some(function(x) { return !orbData.to.hasOwnProperty(x); });
            else {
                mismatch = from.some(function(f) {
                    return to.some(function(t) { return !orbData.map[f] || !orbData.map[f].hasOwnProperty(t); });
                });
            }
            if (mismatch) return false;
        }
        // filter by class-filters  
        if ($rootScope.filters.custom[MATCHER_IDS['captain.ClassBoostingCaptains']] && filters.classCaptain &&
                !CharUtils.isClassBooster('captain', id, filters.classCaptain)) return false;
        if ($rootScope.filters.custom[MATCHER_IDS['special.ClassBoostingSpecials']] && filters.classSpecial &&
                !CharUtils.isClassBooster('special', id, filters.classSpecial)) return false;
        if ($rootScope.filters.custom[MATCHER_IDS['sailor.ClassBoostingSailors']] && filters.classSailor &&
                !CharUtils.isClassBooster('sailor', id, filters.classSailor)) return false;
        if ($rootScope.filters.custom[MATCHER_IDS['sailor.ClassBoostingSupports']] && filters.classSupport &&
                !CharUtils.isClassBooster('support', id, filters.classSupport)) return false;
        return true;
    };

    /*****************
     * Table sorting *
     *****************/

    jQuery.fn.dataTable.ext.type.order['num-string-asc'] = function(x,y) {
        if (x && x.constructor == String) x = (x == 'Unknown' ? 100 : 101);
        if (y && y.constructor == String) y = (y == 'Unknown' ? 100 : 101);
        return x - y;
    };

    jQuery.fn.dataTable.ext.type.order['num-string-desc'] = function(x,y) {
        if (x && x.constructor == String) x = (x == 'Unknown' ? -100 : -101);
        if (y && y.constructor == String) y = (y == 'Unknown' ? -100 : -101);
        return y - x;
    };

    /***********************
     * Table configuration *
     ***********************/

    var data = window.units.filter(function(x) { return x.name && !x.name.includes("Limit Break") && !x.name.includes("Dual Unit"); }).map(function(x,n) {
        var result = [
            ('000' + (x.number+1)).slice(-padding),
            x.name,
            x.type,
            
        x.class.constructor == Array ? x.class.join(', ') : x.class,
            x.maxHP,
            x.maxATK,
            x.maxRCV,
            x.cost,
            x.slots,
            x.stars,
            '',
            x.number
        ];
        additionalColumns.forEach(function(c,n) {
            var temp = 0;
            if (c == 'HP/ATK') temp = Math.round(x.maxHP / x.maxATK * 100) / 100;
            else if (c == 'HP/RCV') temp = Math.round(x.maxHP / x.maxRCV * 100) / 100;
            else if (c == 'ATK/RCV') temp = Math.round(x.maxATK / x.maxRCV * 100) / 100;
            else if (c == 'ATK/CMB') temp = Math.round(x.maxATK / x.combo * 100) / 100;
            else if (c == 'ATK/cost') temp = Math.round(x.maxATK / x.cost * 100) / 100;
            else if (c == 'HP/cost') temp = Math.round(x.maxHP / x.cost * 100) / 100;
            else if (c == 'CMB') temp = x.combo;
            else if (c == 'MAX EXP') temp = x.maxEXP;
            else if (c == 'Limit Break HP') temp = x.limitHP;
            else if (c == 'Limit Break ATK') temp = x.limitATK;
            else if (c == 'Limit Break RCV') temp = x.limitRCV;
            else if (c == 'Limit Break Slots') temp = x.limitSlot;
            else if (c == 'Minimum cooldown' || c == 'Initial cooldown') { 
                var d = cooldowns[x.number];
                if (!d) temp = 'N/A';
                else if (c == 'Minimum cooldown' && d.constructor == Array) temp = d[1];
                else if (c == 'Initial cooldown') temp = (d.constructor == Array ? d[0] : d);
                else temp = 'Unknown';
            }
            else if (c == 'Minimum Limit Break cooldown' || c == 'Initial Limit Break cooldown') { 
                var d = cooldowns[x.number];
                if (!d) temp = 'N/A';
                else if (c == 'Minimum Limit Break cooldown' && d.constructor == Array) temp = (d[1] - x.limitCD);
                else if (c == 'Initial Limit Break cooldown') temp = (d.constructor == Array ? (d[0] - x.limitCD) : (d - x.limitCD));
                else temp = 'Unknown';
            }
            if (temp && temp.constructor != String && !isNaN(temp) && !isFinite(temp)) temp = '&#8734;';
            if (temp && temp.constructor != String && isNaN(temp)) temp = 0;
            result.splice(result.length-2, 0, temp);
        });
        return result;
    });

    tableData = {
        columns: getTableColumns(),
        additional: additionalColumns.length,
        data: data,
        parameters: null,
        fuzzy: $storage.get('fuzzy', false),
        regexes: { },
    };

    $rootScope.table = tableData;

    $rootScope.characterLog = characterLog;
    $rootScope.showLogFilters = log.length > 0;

    $timeout(function() {
        jQuery.fn.dataTable.ext.search.push(tableFilter);
        var types = { story: 'Story Island', fortnight: 'Fortnight', raid: 'Raid', Coliseum: 'Coliseum', Treasure: 'Treasure Map', Ambush: 'Ambush', Bond: 'Kizuna Clash' };
        $rootScope.$watch('table',function(table) {
            tableData = table;
            if (table.parameters && table.parameters.filters && table.parameters.filters.farmable) {
                var filters = table.parameters.filters.farmable;
                farmableLocations = { };
                for (var key in types) {
                    if (filters.hasOwnProperty(key) && filters[key] !== null)
                        farmableLocations[types[key]] = filters[key];
                }
                if (Object.keys(farmableLocations).length === 0)
                    farmableLocations = null;
            } else farmableLocations = null;
            if (table.refresh) table.refresh();
        },true);
    });

    $rootScope.$on('table.refresh',function() { 
        fused = null;
        /*var types = {
        'STR' : '<span class="cell-STR">STR</span>',
        'DEX' : '<span class="cell-DEX">DEX</span>',
        'QCK' : '<span class="cell-QCK">QCK</span>',
        'PSY' : '<span class="cell-PSY">PSY</span>',
        'INT' : '<span class="cell-INT">INT</span>'};
        $.each(types,function(i,type1){
            $.each(types,function(j,type2){
            if(i == j) return;
            $('.cell-'+i+'\\/'+j).html(type1 +'/'+type2);
          });
        });*/
    });

    $rootScope.checkLog = function() {
        var temp = [ ];
        for (var key in $rootScope.characterLog) {
            if ($rootScope.characterLog[key])
                temp.push(parseInt(key,10));
        }
        temp.sort(function(a,b) { return a-b; });
        $storage.set('characterLog', temp);
        $rootScope.showLogFilters = temp.length > 0;
    };

});

})();
