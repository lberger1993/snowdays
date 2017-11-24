const {Builder, By, Key, until} = require('selenium-webdriver');
const request = require('request');
const assert = require('chai').assert;

const loginPage = 'http://localhost:3000/login';
let userName = 'admin';

describe('Login Page', function(){
    this.timeout(5 * 1000 * 60);

    let driver = new Builder()
    .forBrowser('chrome')
    .build();

    beforeEach(function setupWebdriver(){
        driver.get(loginPage);
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
            assert.deepEqual(text, 'List');
        })
       .then(done);
    });

    after(function quitWebdriver(done){
        driver.quit()
        .then(done);
    });
})