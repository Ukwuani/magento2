/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*jshint browser:true jquery:true*/
/*global alert*/
define(
    [
        'jquery',
        'ko'
    ],
    function($, ko) {
        var steps = ko.observableArray();
        return {
            steps: steps,
            stepCodes: [],

            handleHash: function () {
                var hashString = window.location.hash.replace('#', '');
                if (hashString == '') {
                    return false;
                }
                var isRequestedStepVisible = steps.sort(this.sortItems).some(function(element) {
                    return element.code == hashString && element.isVisible();
                });

                //if requested step is visible, then we don't need to load step data from server
                if (isRequestedStepVisible) {
                    return false;
                }
                this.navigateTo(hashString);
                return false;
            },

            registerStep: function(code, title, isVisible, navigate, sortOrder) {
                steps.push({
                    code: code,
                    title : title,
                    isVisible: isVisible,
                    navigate: navigate,
                    sortOrder: sortOrder
                });
                this.stepCodes.push(code);
                var hash = window.location.hash.replace('#', '');
                if (hash != '' && hash != code) {
                    isVisible(false);
                }
            },

            sortItems: function(itemOne, itemTwo) {
                return itemOne.sortOrder > itemTwo.sortOrder ? 1 : -1
            },

            getActiveItemIndex: function() {
                var activeIndex = 0;
                steps.sort(this.sortItems).forEach(function(element, index) {
                    if (element.isVisible()) {
                        activeIndex = index;
                    }
                });
                return activeIndex;
            },

            isProcessed: function(code) {
                var activeItemIndex = this.getActiveItemIndex();
                var sortedItems = steps.sort(this.sortItems);
                var requestedItemIndex = -1;
                sortedItems.forEach(function(element, index) {
                    if (element.code == code) {
                        requestedItemIndex = index;
                    }
                });
                if (requestedItemIndex == -1) {
                    return false;
                }
                return activeItemIndex > requestedItemIndex;
            },

            navigateTo: function(code) {
                var sortedItems = steps.sort(this.sortItems);
                sortedItems.forEach(function(element) {
                    if (element.code == code) {
                        element.navigate();
                    } else {
                        element.isVisible(false);
                    }

                });
            },

            goTo: function(code) {
                var sortedItems = steps.sort(this.sortItems);
                if (!this.isProcessed(code)) {
                    return;
                }
                sortedItems.forEach(function(element) {
                    if (element.code == code) {
                        element.isVisible(true);
                        $('body').animate({scrollTop: $('#' + code).offset().top}, 0, function () {
                            window.location = window.checkoutConfig.checkoutUrl + "#" + code;
                        });
                    } else {
                        element.isVisible(false);
                    }

                });
            },

            next: function() {
                var activeIndex = 0;
                steps.sort(this.sortItems).forEach(function(element, index) {
                    if (element.isVisible()) {
                        element.isVisible(false);
                        activeIndex = index;
                    }
                });
                if (steps().length > activeIndex + 1) {
                    var code = steps()[activeIndex + 1].code;
                    steps()[activeIndex + 1].isVisible(true);
                    $('body').animate({scrollTop: $('#' + code).offset().top}, 0, function () {
                        window.location = window.checkoutConfig.checkoutUrl + "#" + code;
                    });
                }
            },

            back: function() {
                var activeIndex = 0;
                steps.sort(this.sortItems).forEach(function(element, index) {
                    if (element.isVisible()) {
                        element.isVisible(false);
                        activeIndex = index;
                    }
                });
                if (steps()[activeIndex - 1]) {
                    steps()[activeIndex - 1].navigate();
                }
            }
        };
    }
);
