var app = angular.module("PatientMngtCtrl", [])

    .controller("PatientMngtController", function($scope, $location, Consultations, Prescriptions, Abstracts, Diseases, Medicines, Patients, Users) {
       
        $scope.text = "Patient Management";

        // TEMPORARY
        /*
        $scope.patient = {
            "_id" : "591185fde2a4a302e04c04dc",
            "sex" : "M",
            "birthdate" : "2017-05-01T16:00:00Z",
            "lastName" : "Lapu",
            "middleName" : "Kipay",
            "firstName" : "Halibas"
        };
        */
        // TEMPORARY
        

        $scope.patient = {};

        // global variables
        $scope.allAbstractsForPatient       = [];
        $scope.allPrescriptionsForPatient   = [];
        $scope.allConsultationsForPatient   = [];

        $scope.allDiseases                  = [];
        $scope.allMedicines                 = [];

        $scope.abstract                     = {};
        $scope.prescription                 = {};
        $scope.consultation                 = {};

        $scope.factor                       = "";

        // form generation variables 
        $scope.requestFormObject            = {
            "arrRequests"       : [],
            "requestText"       : "",
            "static"            : "Request for: \n",
            "words"             : "",
            "error"             : false
        };

        $scope.referralFormObject           = {
            "static"                    : "",
            "words"                     : "",
            "doctorToReferTo"           : "",
            "referringFor"              : "",
            "additionalNotes"           : "",
            "arrDiagnosesToInclude"     : []
        };

        $scope.certificateFormObject        = {
            "words"                     : "",
            "use"                       : "",
            "arrDiagnosesToInclude"     : []
        };

        // update functions and processing of data
        var updateHighlightedPatient = function() {

        };

        var updateAllAbstractsForPatient = function() {
            Abstracts.getAbstractsWithPatientID($scope.patient._id).then(function(results) {
                $scope.allAbstractsForPatient = results;
            });
        };

        var updateAllPrescriptionsForPatient = function() {
            Prescriptions.getAllPrescriptionsForPatient($scope.patient._id).then(function(results) {
                $scope.allPrescriptionsForPatient = results;

                // looping through all prescriptions for patient
                angular.forEach($scope.allPrescriptionsForPatient, function(prescription) {

                    // through each medicine in prescription array
                    angular.forEach(prescription.prescriptionPerMedicine, function(medicine) {
                        
                        prescription.prescriptionPerMedicineWithData = [];

                        // getting medicine data in db
                        Medicines.getMedicine(medicine.medicine).then(function(result) {
                            result.medicine = "";
                            result.quantity = 0;
                            result.instruction = "";
                            result._id = ""

                            result._id = medicine._id;
                            result.medicine = medicine.medicine;
                            result.quantity = medicine.quantity;
                            result.instruction = medicine.instruction;
                            prescription.prescriptionPerMedicineWithData.push(result);
                        });

                    });

                });
            });
        };

        var updateAllConsultationsForPatient = function() {
            Consultations.getAllConsultationsForPatient($scope.patient._id).then(function(results) {
                $scope.allConsultationsForPatient = results;

                // looping through each consultation 
                angular.forEach($scope.allConsultationsForPatient, function(consultation) {
                    
                    // through diagnoses array 
                    angular.forEach(consultation.diagnoses, function(diagnosis) {
                        
                        consultation.diagnosesWithData = [];

                        // getting diseases data
                        Diseases.getDisease(diagnosis).then(function(result) {
                            consultation.diagnosesWithData.push(result);
                        });

                    });

                });
            });
        };

        var updateNecessaryData = function() {
            // all medicine data
            Medicines.getAllMedicines().then(function(results) {
                $scope.allMedicines = results;
            });

            // all disease data
            Diseases.getAllDiseases().then(function(results) {
                $scope.allDiseases = results;
            });
        };

        $scope.initializeData = function() {
            Patients.getHighlightedPatient().then(function(result) {
                $scope.patient = result;
                updateNecessaryData();
                updateAllAbstractsForPatient();
                updateAllPrescriptionsForPatient();
                updateAllConsultationsForPatient();
                $scope.resetGlobalVars();
            });
        };

        $scope.resetGlobalVars = function() {
            $scope.consultation = {
                "_id"               : "",
                "patientID"         : $scope.patient._id,

                "dateIssued"        : "",
                "diagnoses"         : [],
                "diagnosesWithData" : []
            };

            $scope.abstract     = {
                "_id"               : "",
                "patientID"         : $scope.patient._id,

                "content"           : ""
            };

            $scope.prescription = {
                "_id"                               : "",
                "patientID"                         : $scope.patient._id,

                "advices"                           : {
                    "generalIns"    : "",
                    "dietaryIns"    : "",
                    "instruction"   : ""
                },

                "prescriptionPerMedicine"           : [],
                "prescriptionPerMedicineWithData"   : []

            };

            $scope.factor       = "";
            $scope.resetQuery();
        };


        // setting factors and necessary data with each object in app

        // splicing arrays
        $scope.spliceDiagnosis = function(diagnosis) {
            var first = $scope.consultation.diagnoses.indexOf(diagnosis._id);
            var second = $scope.consultation.diagnosesWithData.indexOf(diagnosis);
            
            if(first != -1) {
                $scope.consultation.diagnoses.splice(first, 1);
            }

            if(second != -1) {
                $scope.consultation.diagnosesWithData.splice(second, 1);
            }
        };

        $scope.pushDiagnosis = function() {
            $scope.consultation.diagnosesWithData.push($scope.object);
            $scope.consultation.diagnoses.push($scope.object._id);

            $scope.resetQuery();
        };

        $scope.splicePrescription = function(prescription) {
            
            var first = -1;
            var second = $scope.prescription.prescriptionPerMedicineWithData.indexOf(prescription);

            angular.forEach($scope.prescription.prescriptionPerMedicine, function(medicine) {
                if(medicine._id === prescription._id) {
                    
                    first = $scope.prescription.prescriptionPerMedicine.indexOf(medicine);

                    if(first != -1) {
                        $scope.prescription.prescriptionPerMedicine.splice(first, 1);
                    }

                    if(second != -1) {
                        $scope.prescription.prescriptionPerMedicineWithData.splice(second, 1);
                    }
                };
            });

        };

        $scope.pushPrescription = function(prescription) {
            $scope.prescription.prescriptionPerMedicineWithData.push($scope.object);
            $scope.prescription.prescriptionPerMedicine.push(
                {
                    "medicine"      : $scope.object._id,
                    "quantity"      : $scope.object.quantity,
                    "instruction"   : $scope.object.instruction
                }
            );

            $scope.resetQuery();
        };

        // edit
        $scope.editAbstract = function(abstract) {
            setFactorToAbstract();

            $scope.abstract     = {
                "_id"               : abstract._id,
                "patientID"         : $scope.patient._id,
                "dateIssued"        : abstract.dateIssued,

                "content"           : abstract.content
            };
        };

        $scope.editConsultation = function(consultation) {
            setFactorToConsultation();

            $scope.consultation = {
                "_id"               : consultation._id,
                "patientID"         : $scope.patient._id,

                "dateIssued"        : consultation.dateIssued,
                "diagnoses"         : consultation.diagnoses.slice(),
                "diagnosesWithData" : consultation.diagnosesWithData.slice()
            };
        };

        $scope.editPrescription = function(prescription) {
            setFactorToPrescription()

            $scope.prescription = {
                "dateIssued"                        : prescription.dateIssued,

                "_id"                               : prescription._id,
                "patientID"                         : $scope.patient._id,

                "advices"                           : {
                    "generalIns"    : prescription.advices.generalIns,
                    "dietaryIns"    : prescription.advices.dietaryIns,
                    "instruction"   : prescription.advices.instruction
                },

                "prescriptionPerMedicine"           : prescription.prescriptionPerMedicine.slice(),
                "prescriptionPerMedicineWithData"   : prescription.prescriptionPerMedicineWithData.slice()
            };
        };

        // add
        $scope.addAbstract = function() {
            $scope.resetGlobalVars();
            setFactorToAbstract();
        };

        $scope.addConsultation = function() {
            $scope.resetGlobalVars();
            setFactorToConsultation();
        };

        $scope.addPrescription = function() {
            $scope.resetGlobalVars();
            setFactorToPrescription();
        };

        // delete key setting 
        $scope.setDeleteKeyAndFactorForAbstract = function(abstractID) {
            setFactorToAbstract();

            $scope.abstract._id = "";
            $scope.abstract._id = abstractID;
        };

        $scope.setDeleteKeyAndFactorForConsultation = function(consultationID) {
            setFactorToConsultation();

            $scope.consultation._id = "";
            $scope.consultation._id = consultationID;
        };
        
        $scope.setDeleteKeyAndFactorForPrescription = function(prescriptionID) {
            setFactorToPrescription();
            
            $scope.prescription._id = "";
            $scope.prescription._id = prescriptionID;
        };


        // REAL CRUD FUNCTIONS 
        $scope.update = function() {
            if($scope.factor === "abstract") {
                console.log("abstract");

                Abstracts.updateAbstract($scope.abstract._id, $scope.abstract).then(function(result) {
                    console.log(result);
                    updateAllAbstractsForPatient();
                });
            } else if ($scope.factor === "consultation") {
                console.log("consultation")

                Consultations.updateConsultation($scope.consultation._id, $scope.consultation).then(function(result) {
                    console.log(result);
                    updateAllConsultationsForPatient();
                });
            } else if ($scope.factor === "prescription") {
                console.log("prescription");

                Prescriptions.updatePrescription($scope.prescription._id, $scope.prescription).then(function(result) {
                    console.log(result);
                    updateAllPrescriptionsForPatient();
                });
            }

            $scope.resetGlobalVars();
        };

        $scope.save = function() {
            if($scope.factor === "abstract") {
                console.log("abstract");
                
                Abstracts.addAbstract($scope.abstract).then(function(result) {
                    console.log(result);
                    updateAllAbstractsForPatient();
                });
            } else if ($scope.factor === "consultation") {
                console.log("consultation")

                Consultations.addConsultation($scope.consultation).then(function(result) {
                    console.log(result);
                    updateAllConsultationsForPatient();
                });
            } else if ($scope.factor === "prescription") {
                console.log("prescription");

                Prescriptions.addPrescription($scope.prescription).then(function(result) {
                    console.log(result);
                    updateAllPrescriptionsForPatient();
                });
            }

            $scope.resetGlobalVars();
        };

        $scope.delete = function() {
            if($scope.factor === "abstract") {
                console.log("abstract");

                Abstracts.deleteAbstract($scope.abstract._id).then(function(result) {
                    console.log(result);
                    updateAllAbstractsForPatient();
                });
            } else if ($scope.factor === "consultation") {
                console.log("consultation")

                Consultations.deleteConsultation($scope.consultation._id).then(function(result) {
                    console.log(result);
                    updateAllConsultationsForPatient();
                });
            } else if ($scope.factor === "prescription") {
                console.log("prescription");

                Prescriptions.deletePrescription($scope.prescription._id).then(function(result) {
                    console.log(result);
                    updateAllPrescriptionsForPatient();
                });
            }

            $scope.resetGlobalVars();
        };


        
        // factor functions
        var setFactorToAbstract = function() {
            $scope.factor = "abstract";
        };

        var setFactorToConsultation = function() {
            $scope.factor = "consultation";
        };

        var setFactorToPrescription = function() {
            $scope.factor = "prescription";
        };

        
        // extra functions
        $scope.fixDate = function(object) {
            console.log("to the fucn: "+ object.dateIssued);
            var newDate = new Date(object.dateIssued);
            object.fixedDate = newDate.getUTCMonth()+1 + "/" + newDate.getUTCDate() + "/" + newDate.getUTCFullYear();
        };

        $scope.fixDateWithNamedMonth = function(date) {
            var newDate = new Date(date);
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            return months[newDate.getUTCMonth()] + " " + newDate.getUTCDate() + " " + newDate.getUTCFullYear();
        };

        $scope.fixMedicineName = function(prescription) {
            prescription.fixedName = prescription.genericName + " | " + prescription.brandName + ' | ' + prescription.dose;
        };

        $scope.fixAge = function(date) {
            var newDate = new Date(date);
            var ageDifMs = Date.now() - newDate.getTime();
            var ageDate = new Date(ageDifMs);

            return Math.abs(ageDate.getUTCFullYear() - 1970);
        };

        $scope.setQuery = function(query) {
            $scope.object = query;
            $scope.query = query;
            $scope.focus = false;
        };

        $scope.resetQuery = function() {
            $scope.object = {};
            $scope.query = {};
        };


        // location functions
        $scope.pathToPatientSearch = function() {
            $location.path('/patientsearch');
        };


        // request form
        $scope.pushInRequestFormObject = function() {
            $scope.requestFormObject.arrRequests.push($scope.requestFormObject.requestText);
            $scope.requestFormObjectChange();
            $scope.requestFormObject.requestText = "";
        };

        $scope.spliceInRequestFormObject = function(word) {
            var index = $scope.requestFormObject.arrRequests.indexOf(word);

            if(index != -1) {
                $scope.requestFormObject.arrRequests.splice(index, 1);
                $scope.requestFormObjectChange();
            };
        };

        $scope.requestFormObjectChange = function() {
            $scope.requestFormObject.words = $scope.requestFormObject.static;
            for(var change = 0 ; change<$scope.requestFormObject.arrRequests.length ; change+=1) {
                $scope.requestFormObject.words = $scope.requestFormObject.words + "\n" + $scope.requestFormObject.arrRequests[change] + "\n";
            };
        };

        $scope.generateRequestForm = function() {

            var object = {
                text        : $scope.requestFormObject.words,
                style       : 'content'
            };

            pdfMake.createPdf(formatter(object)).download("request.pdf");
        };


        // referral form
        $scope.initializeReferralForm = function() {
            $scope.referralFormObject.arrDiagnosesToInclude = $scope.consultation.diagnosesWithData.slice();
            //console.log($scope.consultation.diagnosesWithData);

            $scope.referralFormObjectChange();
        };

        $scope.referralFormObjectChange = function() {
            var patientLabel    = "";
            var patientName     = $scope.patient.firstName + " " + $scope.patient.middleName + " " + $scope.patient.lastName;
            var age             = $scope.fixAge($scope.patient.birthdate);
            var sex             = $scope.patient.sex;

            if ($scope.patient.sex == "F") 
                patientLabel = "MS"
            else if ($scope.patient.sex == "M")
                patientLabel = "MR"

            $scope.referralFormObject.words = "Dear " + $scope.referralFormObject.doctorToReferTo + "\n\n" + "Referring to you " + patientLabel + " " + patientName + " " + age + " years old " + sex + " for " + $scope.referralFormObject.referringFor;

            // processing of diagnosis entries
            var strEnumerationOfDiagnoses = "\nI am treating this patient for: \n\n";
            var strEnumeratedDiagnoses = strEnumerationOfDiagnoses;

            for(var i = 0 ; i < $scope.referralFormObject.arrDiagnosesToInclude.length ; i += 1) {
                console.log($scope.referralFormObject.arrDiagnosesToInclude[i].name);
                strEnumeratedDiagnoses = strEnumeratedDiagnoses + $scope.referralFormObject.arrDiagnosesToInclude[i].name + "\n";
            };


            // processing of additional notes
            var strAdditionalNotes = "\n" + $scope.referralFormObject.additionalNotes + "\n";

            // respectfully yours
            var strEndWords = "\n\nRespectfully, \nDr. Dioquino";

            $scope.referralFormObject.words = $scope.referralFormObject.words + strEnumeratedDiagnoses + strAdditionalNotes + strEndWords;
        };

        $scope.referralFormObjectArrayChange = function() {

        };

        $scope.spliceInReferralFormObject = function(diagnosis) {
            var index = $scope.referralFormObject.arrDiagnosesToInclude.indexOf(diagnosis);
            
            if(index != -1)
                $scope.referralFormObject.arrDiagnosesToInclude.splice(index, 1);
        };

        $scope.generateReferralForm = function() {

            var object = {
                text    : $scope.referralFormObject.words,
                style   : 'content'
            };

            pdfMake.createPdf(formatter(object)).download("referral.pdf");

        };

        // certificate
        $scope.initializeCertificateForm = function(){
            $scope.certificateFormObject.arrDiagnosesToInclude = $scope.consultation.diagnosesWithData.slice();
            
            $scope.certificateFormObjectChange();
        };

        $scope.certificateFormObjectChange = function() {

            var patientName     = $scope.patient.firstName + " " + $scope.patient.middleName + " " + $scope.patient.lastName;
            var age             = $scope.fixAge($scope.patient.birthdate);

            var header          = "This is to certify that " + patientName + ", " + age + " is under my care for: \n";

            var list            = "";
            
            for(var i = 0 ; i < $scope.certificateFormObject.arrDiagnosesToInclude.length ; i+=1) {
                list = list + $scope.certificateFormObject.arrDiagnosesToInclude[i].name + "\n";
            };

            var footer          = "\nThis certificate is issued for " + $scope.certificateFormObject.use + "."

            $scope.certificateFormObject.words = header + list + footer;
        };

        $scope.spliceInCertificateObject = function(diagnosis) {
            var index = $scope.certificateFormObject.arrDiagnosesToInclude.indexOf(diagnosis);

            if(index != -1)
                $scope.certificateFormObject.arrDiagnosesToInclude.splice(index, 1);
        };

        $scope.generateCertificate = function() {

            var object = {
                text        : $scope.certificateFormObject.words,
                style       : 'content'
            };

            pdfMake.createPdf(formatter(object)).download("certificate.pdf");
        };


        $scope.checkDuplicates = function(array) {
            // check idwe have duplciates
        };

        $scope.generatePatientInformation = function() {

            var content = [];

            angular.forEach($scope.allConsultationsForPatient, function(consultation) {

                var arrDiagnoses = [];

                angular.forEach(consultation.diagnosesWithData, function(diagnosis) {
                    $scope.fixDate(consultation);
                    arrDiagnoses.push(diagnosis.name);
                });

                var object = {
                    columns : [
                        {
                            text    : consultation.fixedDate,
                            width   : "*",
                            style   : 'patientInfoDateIssued'
                        }, 
                        {
                            stack   : arrDiagnoses,
                            width   : "*",
                            style   : 'diseaseNameInfo'
                        }
                    ]
                };

                content.push(object);
                console.log("im still moving");
            });

            var anotherObject = {
                stack       : content
            }; 

            pdfMake.createPdf(formatter(anotherObject)).download("patientinformation.pdf");

        };

        $scope.generateAbstract = function() {

            var object = {
                text    : $scope.abstract.content,
                style   : 'abstractContent'
            };

            pdfMake.createPdf(formatter(object)).download('abstract.pdf');
        };


        // dirty!
        $scope.generatePrescription = function() {  

            var content = [];

            angular.forEach($scope.prescription.prescriptionPerMedicineWithData, function(prescription) {
            
            var object = {
                columns : [
                    // medicine name
                    {
                        text    : prescription.genericName,
                        width   : 120,
                        style   : 'prescriptionMedicine'
                    },
                    // medicine quantity
                    {
                        text    : prescription.quantity,
                        width   : 60,
                        style   : 'prescriptionQuantity'
                    },
                    // medicine instructions
                    {
                        text    : prescription.instruction,
                        width   : "*",
                        style   : 'prescriptionInstruction'
                    }
                ]
            };

            content.push(object);

        });
        
            var anotherObject = {
                stack       : content
            }; 

            pdfMake.createPdf(formatter(anotherObject)).download("prescription.pdf");

        };

        var formatter = function(words) {

            // dynamic patient data
            var patientName = $scope.patient.firstName + " " + $scope.patient.middleName + " " + $scope.patient.lastName;
            var dateToday = $scope.fixDateWithNamedMonth(new Date());
            var patientAddress = $scope.patient.address;
            var age = $scope.fixAge($scope.patient.birthdate);
            var sex = $scope.patient.sex;

            var format = {

    pageSize        : 'A5',
	content: [ {
	        text    : 'Dr. Carissa Paz C. Dioquino, M.D.',
	        style   : 'header'
	    }, {
	        stack   : ['Neurologist - Toxicologist', 'Fellow, Philippine Neurologist Association'],
	        style   : 'subHeader'
	    }, {
	        columns : [ {
	        	stack   : [{
	                        text    : 'Rm. 201 Mirasol Building'
	                        }, {
	                            text    : 'Apacible St. Cor. Taft Avenue, Manila'
	                        }, {
	                            stack   : [
	                                    'Fri: 4:00 pm - 7:00 pm',
	                                    'Sat: 10:00 am - 12:00 nn',
	                                ]
	                        },{
	                            text    : 'Tel No. 782-6062'
	                        }
	                    ],
	                style   : 'address'
	            }, {
	                stack   : [ {
	                            text    : 'Rm. 509 Medical Arts Center'
	                        }, {
	                            text    : "Manila Doctor's Hospital T.M. Kalaw St."
	                        }, {
	                            stack   : [
	                                    'Mon/Thurs: 5:00 pm - 7:00 pm'
	                                ]
	                        },
	                        
	                        // teleohone number of office
	                        {
	                            text    : 'Tel No. 558-0888 Loc.4410'
	                        }
	                    ],
	                style   : 'address'
	            },
	            
	            // address 3
	            {
	                stack   : [
	                        // main room number
	                        {
	                            text    : 'Rm. 1117 North Tower'
	                        },
	                        
	                        // real address of the office/clinic
	                        {
	                            text    : "Cathedral Heights Bldg. St. Luke's Medical Center"
	                        },
	                        
	                        // time slots
	                        {
	                            stack   : [
	                                    'Tues: 10:00 am - 12:00 nn'
	                                ]
	                        },
	                        
	                        // teleohone number of office
	                        {
	                            text    : 'Tel No. 725-8486'
	                        }
	                    ],
	                style   : 'address'
	            },
	            
	       ],
	       
	       margin   : [0, 0, 0, 0]
	    },
	    
	    // 'ALL CLINICS BY APPOINTMENT'
	    {
	        text        : '\nALL CLINICS BY APPOINTMENT',
	        bold        : true,
	        fontSize    : 12,
	        alignment   : 'center'
	    },
	    
	    // patient info
	    {
	        stack       : [
	            
	            // 1st line - name and date
	            {
	                columns : [
	                    
	                        // name
	                        {
	                            text    : [
	                            {
	                                text    : 'Patient Name: ',
	                                style   : 'infoMarker'
	                            },
	                            {   text    : patientName,
	                                style   : 'patientInfo'
	                            }
	                            ],
	                            
	                            width   : '*',
	                        },
	                        
	                        // date
	                        {
	                            text    : [
	                            {
	                                text    : 'Date: ',
	                                style   : 'infoMarker'
	                            },
	                            {
	                                text    : dateToday,
	                                style   : 'patientInfo'
	                            }
	                            ],
	                            
	                            width   : '*'
	                        }
	                    ]      
	            },
	            
	            // 2nd line - address, age, sex
	            {
	                columns : [
	                        
	                        // address
	                        {
	                            text    : [
	                                {
	                                    text    : 'Address: ',
	                                    style   : 'infoMarker'
	                                },
	                                {
	                                    text    : patientAddress,
	                                    style   : 'patientInfo'
	                                }
	                            ],
	                            
	                            width   : '*'
	                        },
	                        
	                        // age and sex
	                        {
	                            columns : [
	                                
	                                // age
	                                {
	                                    text    : [
	                                    
	                                    {
	                                        text    : 'Age: ',
	                                        style   : 'infoMarker'
	                                    },
	                                    
	                                    {
	                                        text    : age,
	                                        style   : 'patientInfo'
	                                    }
	                                    ],
	                                    
	                                    width   : '*'
	                                },
	                                
	                                // sex
	                                {
	                                    
	                                    text   : [
	                                     
	                                    {
	                                        text    : 'Sex: ',
	                                        style   : 'infoMarker'
	                                    },
	                                   
	                                    {
	                                        text    : sex,
	                                        style   : 'patientInfo'
	                                    }
	                                        
	                                    ],
	                                    
	                                    width   : '*'
	                                }
	                                
	                            ],
	                            
	                            width   : '*'
	                        }
	                        
	                    ]
	            }
	        ]
	    },

        {
            text    : [
                '\n',
                '\n',
                '\n'
            ]
        },
	    
	    // EVERY DYNAMIC CONTENT GOES HERE!!!!
        {
            stack   : [] // an ARRAY
        }
	    
	],
	
	// footer
	footer  : {
	  
	  columns   : [
	      
	    {
	        
	    },
	    
	    // doctor licnese and info
	    {
	        stack   : [
	            
	            // doctor name
	            {
	                text    : 'Carissa Paz C.Dioquino, MD',
	                style   : 'footer'
	            },
	            
	            // licenses and ptr
	            {
	                text    : [
	                    'Lic No ',
	                    
	                    {   text  : '69908',
	                        style : 'footer'
	                    }, // license
	                    
	                    ' PTR ',
	                    
	                    {   text  : '6043889',
	                        style : 'footer'
	                    } // ptr
	                ]
	            }
	        ]
	    }
	  
	  ]  
	    
	},
	
	styles          : {
	    
	    header      : {
	        fontSize    : 18,
	        alignment   : 'center',
	        bold        : true
	    },
	    
	    footer      : {
	        fontSize    : 11,
	        alignment   : 'left'
	    },
	    
	    subHeader   : {
	        fontSize    : 11,
	        alignment  : 'center'
	    },
	    
	    address     : {
	        fontSize    : 8,
	        width       : '*'
	    },
	    
	    patientInfo : {
	        fontSize    : 11
	    },
	    
	    infoMarker  : {
	        bold        : true,
	        fontSize    : 11
	    },

        prescriptionMedicine    : {
            fontSize            : 11,
            width               : 40
        },

        prescriptionQuantity    : {
            fontSize            : 11,
            width               : 40
        },

        prescriptionInstruction : {
            fontSize            : 11,
            width               : '*'
        },

        abstractContent         : {
            fontSize            : 11,
            alignment           : 'left'
        },

		content					: {
			fontSize			: 11
		},

        patientInfoDateIssued   : {
            fontSize            : 11
        },

        diseaseNameInfo         : {
            fontSize            : 11
        }
	}
};

        format.content[6].stack.push(words);
        
        return format;

        };

    });
















    app.filter('searchDiseases', function() {
        return searchDiseases;
    });

    function searchDiseases(arr, query) {
        if(!query) {
            return arr;
        }
        
        var results = [];

        query = query.toLowerCase();

        angular.forEach(arr, function(item) {
            
            if(item.name.toLowerCase().indexOf(query) !== -1) {
                results.push(item);
            };
            
        })
        
        return results;
    }; 


    
    app.filter('searchMedicines', function() {
        return searchMedicines;
    });

    function searchMedicines(arr, query) {
        if(!query) {
            return arr;
        }
        
        var results = [];
        //console.log(query.genericName.toLowerCase());
        query = query.toLowerCase();

        angular.forEach(arr, function(item) {
            
            if(item.genericName.toLowerCase().indexOf(query) !== -1) {
                results.push(item);
            };
            
        })
        
        return results;
    }; 
