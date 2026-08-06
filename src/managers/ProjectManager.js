export default class ProjectManager {


    constructor(){

        this.projectPath = null;

        console.log(
            "ProjectManager créé"
        );

    }



    async newProject(){


        const path =
            await window.electronAPI.createProject();



        console.log(
            "NEW PROJECT PATH:",
            path
        );



        if(!path){

            return null;

        }



        this.projectPath =
            path + "/project.opentree";



        return {

            nodes:[],

            edges:[]

        };


    }




    async saveProject(nodes,edges){


        console.log(
            "SAVE DEMANDE",
            this.projectPath
        );



        if(!this.projectPath){


            console.error(
                "Aucun projet ouvert"
            );


            return false;

        }



        const result =
            await window.electronAPI.saveProject({


                path:this.projectPath,


                project:{


                    nodes:nodes,

                    edges:edges


                }


            });



        console.log(
            "SAVE RESULT",
            result
        );



        return result;


    }



}
