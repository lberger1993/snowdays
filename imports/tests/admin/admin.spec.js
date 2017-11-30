const {Builder, By, Key, until, Options} = require('selenium-webdriver');
const request = require('request');
const assert = require('chai').assert;

const loginPage = 'http://localhost:3000/login';
let userName = 'admin';

describe('Admin E2E test', function(){
    this.timeout(500 * 1000 * 60);
    var caps = {
        name : 'E2E Test',
        build :  '1.0.0',
        browserName : 'chrome', 
        platform : 'mac', 
        screen_resolution : '1024x768',
        record_video : 'true',
        record_network : 'true',
        userName: 'kamolchanok.tangsri@gmail.com',
        password: 'Secret12'
    };

    let driver = new Builder()
    .forBrowser('chrome')
    .withCapabilities(caps)
    .build();

    beforeEach(function setupWebdriver(){
        driver.get(loginPage);
        driver.manage().timeouts().implicitlyWait(500000000);
    });

    it("Admin success login credentials", function(done){
        
        var username = driver.findElement(By.id("username"));
        username.click()
        .then(function(){username.sendKeys(userName); } )
        
        var password = driver.findElement(By.id("password"));
        password.click()
        .then(function(){password.sendKeys("password"); } )
        
        driver.findElement(By.css("button.sn-btn-blue")).click()
        .then(function(){
            return driver.wait(until.elementLocated(By.id("list")), 5000)
        })
        .then(function(element){
            return element.getText();
        })
        .then(function(text){
            assert.deepEqual(text, 'List', 'Login success.');
        })
       .then(done);
    });

    it("Admin List Display Participant", function(done) {
        driver.get("http://localhost:3000/admin/admin");
        driver.wait(until.elementLocated(By.id("list")), 5000)
        .click()
        .then(function(){
            return driver.wait(until.elementsLocated(By.tagName("th")),5000)
            .then(function(element){
                return element[1].getText()
            })
            .then(function(text){
                assert.deepEqual(text.toLocaleLowerCase(), 'first name', 'Participant list is shown.');
            })
            .then(done);
        });
    })

    it("Admin Add Accommodation success", function(done) {
        driver.get("http://localhost:3000/admin/admin");
        driver.wait(until.elementLocated(By.id('add_new')), 5000).click();

        var accommodation_name = driver.findElement(By.id("accommodation_name"));
        accommodation_name.click()
        .then(function(){accommodation_name.sendKeys('Rainerum'); } )
        
        var accommodation_address = driver.findElement(By.id("accommodation_address"));
        accommodation_address.click()
        .then(function(){accommodation_address.sendKeys('Bolzano'); } )

        var bus_zone = driver.findElement(By.id("bus_zone"));
        bus_zone.click()
        .then(function(){bus_zone.sendKeys('1'); } )

        var capacity = driver.findElement(By.id('capacity'));
        capacity.click()
        .then(function() { capacity.sendKeys('20');})
        
        driver.findElement(By.id("AccommodationSubmit")).click()
        .then(function(){
            return driver.wait(until.elementLocated(By.className("swal2-overlay")), 5000)
        })
        .then(function(element){
            return element.getAttribute('style');
        })
        .then(function(text){
            assert.notInclude(text.toLowerCase(), 'display: none;', 'Adding accommodation is successful.');
        })
       .then(done);
    })

    it("Admin Statistic Display success", function(done){
        driver.get("http://localhost:3000/admin/admin");
        driver.wait(until.elementLocated(By.id("stats")), 5000)
        .click()
        .then(function(){
            return driver.wait(until.elementsLocated(By.className("chartjs-size-monitor")),5000)
            .then(function(element){
                assert.notEqual(element, null , 'first name', 'Chart is shown.');
            })
            .then(done);
        });
    })

    it("Admin Match Participant", function(done) {
        driver.get("http://localhost:3000/admin/admin");
        driver.wait(until.elementLocated(By.id("match")), 5000)
        .click()
        .then(function(){
            let matchPaticipant = driver.findElement(By.id("matchingParticipants"));
            matchPaticipant.click()
            .then(function() {
                return driver.wait(until.elementsLocated(By.id("MatchingParticipants_table")),5000)
            })
            .then(function(element){
                assert.notEqual(element, null, 'Participant matching table is displayed.');
            })
            .then(done);
        });
    })

    after(function quitWebdriver(done){
        driver.quit()
        .then(done);
    });
})