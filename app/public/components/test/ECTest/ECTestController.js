(function(){
    'use strict';

    App.controller('ECTestController', [ '$scope', '$state','TestService',
        function($scope, $state, TestService){

            $scope.testName = 'Engineering & Construction Test';
            $scope.tests = null;
            var testIndex = 2;
            $scope.question_index = 0;
            $scope.numQuestionsAnswered = 0;
            $scope.error = false;
            $scope.finished = false;
            $scope.array = [];
            $scope.resultsPage = false;

            $scope.getTests = function(){
                TestService.getTests()
                    .then(function (res) {
                        $scope.tests = res.data;
                        //console.log("tests gathered");
                    }, function (err) {
                        console.log('Get tests Error ' + err);
                        $scope.tests = null;
                    })
            };
            $scope.getTests();



            $scope.setActiveQuestion = function(i){
                if(i === undefined){
                    var out = false;

                    var length = $scope.tests[testIndex].questions[0].question.length - 1;

                    while(!out){
                        $scope.question_index = $scope.question_index < length?++$scope.question_index:0;

                        if($scope.question_index === 0){
                            $scope.error = true;
                        }

                        if($scope.tests[testIndex].questions[0].question[$scope.question_index].selected === null){
                            out = true;
                        }

                    }
                }else{
                    $scope.question_index = i;
                }
            };

            $scope.next = function(){
                // set quizLength variable to keep code clean
                var length = $scope.tests[testIndex].questions[0].question.length;

                $scope.numQuestionsAnswered = 0;
                //For loop added to loop through all questions and recount questions
                //that have been answered. This avoids infinite loops.

                if($scope.numQuestionsAnswered >= length){
                    $scope.finished = true;
                }
                for(var x = 0; x < length; x++){
                    if($scope.tests[testIndex].questions[0].question[$scope.question_index].selected !== null){
                        $scope.numQuestionsAnswered++;
                        if($scope.numQuestionsAnswered >= length){
                            // final check to ensure all questions are actuall answered
                            for(var i = 0; i < length; i++){
                                /*
                                 * if find a question that is not answered, set it to
                                 * active question then return from this function
                                 * to ensure finalise flag is not set
                                 */
                                if($scope.tests[testIndex].questions[0].question[i].selected === null){
                                    $scope.setActiveQuestion(i);
                                    return;
                                }
                            }
                            // set finalise flag and remove any existing warnings
                            $scope.error = false;
                            $scope.finished = true;
                            return;
                        }
                    }
                }
                $scope.setActiveQuestion();
            };

            $scope.defineResult = function(currentAnswer){
                var sectors = {
                    "engineering":0,
                    "construct":0
                };

                sectors.engineering+=currentAnswer.weight[0];
                sectors.construct+=currentAnswer.weight[1];

                if($scope.array.length!=0){
                    $scope.array[0].engineering+=sectors.engineering;
                    $scope.array[0].construct+=sectors.construct;
                }else{
                    $scope.array.push(sectors);
                }
                console.log(JSON.stringify($scope.array)+" array");

            };

            $scope.selectAnswer = function(index){
                $scope.tests[testIndex].questions[0].question[$scope.question_index].selected= index;
                //console.log($scope.tests[testIndex].questions[0].question[$scope.question_index].options[index].option);
                console.log(index);
            };


            $scope.markQuiz = function(){
                // var length = $scope.tests[testIndex].questions[0].question.length;
                for(var x = 0; x < $scope.tests[testIndex].questions[0].question.length; x++){
                    var index = $scope.tests[testIndex].questions[0].question[x].selected;
                    $scope.defineResult($scope.tests[testIndex].questions[0].question[x].options[index]);
                }
                console.log("finished marking");
            };

            $scope.finaliseAnswers = function(){
                $scope.finished = true;
                $scope.numQuestionsAnswered = 0;
                $scope.resultsView = true;
                $scope.markQuiz();


                $state.go('app.results',{
                    sectorsArray: JSON.stringify($scope.array)
                });

            };
        }]);
})();