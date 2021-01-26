# Rocksi
Rocksi is the R**obot** Bl**ock**s **Si**mulator. Acronyms are strange :)

Rocksi is a robot simulator that runs entirely in (modern) web browsers with absolutely no installation. It is thus platform independent and won't care if students are working on Android tablets, iPads or Laptops. The robot is programmed using the popular [Blockly](https://developers.google.com/blockly/) library and a custom execution routine (which is also used by Scratch, Niryo, and a bunch of other projects). 

In time I plan to add more robots and blocks (suggestions?), but for now I decided to use the [Franka Emika](https://franka.de/) robot.


## Motivation
Robots are one of the corner stones of future industries and technological development. The recent years' advancements in control, intuivity and sensitivity has made these beautiful yet complex machines much more accessible. Modern robots manage to hide much of their complexity, to the degree that even non-specialists and children can handle them with ease. 

Despite these major advancements, to the average person robots stay elusive and incomrpehensible, almost mystical. This is for two reasons:
* they are expensive and hard to come by
* the knowledge and tech that makes them move is non-trivial and inaccessible

To this end many schools throughout the world have started adding robotics to their curricula. However, their expensive nature gave rise to a new problem: at classes of 20-40 students, how can every student work with the robot if the school can't afford to spend hundreds of thousands of dollars? This is where Rocksi comes in!


## Robokind
Rocksi is developed as part of my work at [Robokind](https://www.robokind.de), a non-profit foundation that strives to make robots more accessible to the general public. Check them out, they are nice! 

![Robokind](https://robokind.de/wp-content/uploads/2020/10/cropped-Logo_Robokind_black_600x134.png)


## Further Reading
If you speak German and want to learn more about robotics, Robokind offers several free courses such as the **Roboterführerschein** (robots driving license) on their [Moodle platform](https://robotikschulungen.de). Feel free to check it out!


## Building
You will need [npm](https://www.npmjs.com/) or any other package manager that can handle `package.json` files to build this project. First install the dependencies by running the following command in the project's root directory:
```
npm install
```

Afterwards you can build the project in development or build mode by running
```
npm run [dev|build]
```

This will also start a local parcel webserver serving Rocksi. Especially when running in `build` mode, check the `scripts` section in package.json as it may contain some settings that influence the build process.



