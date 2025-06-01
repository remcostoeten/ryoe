We want for the desktop application a aesthetic minimal footer which displays information about the app. This consists of multiple tasks which I want you to do:

0. Create a `src/app/config.ts` file which contains the following:

````ts
export const APP_NAME = 'Notr';
export const APP_VERSION = '0.1.0';
export const APP_AUTHOR = 'Remco Stoeten';
export const APP_AUTHOR_URL = 'https://github.com/remcostoeten';
export const APP_REPOSITORY_URL = 'https://github.com/remcostoeten/notr-tauri`;
```

1) Create the footer  component via proper semantics, render (for this part) static text to define the ui.


- a `<footer></footer>` element that is 100vw and  has two sections it which are `justify-between` making the left aligned and the right aligned.-
- The left section should contain:
     - The application name (pulled from a cfg file)
     - A `●` that acts as a divider
     - The version number (static for this part)
- The right section should contain:
     -  `Built with ❤️  by Remco Stoeten` (remco stoeten is the author, should be pulled from a cfg file. Wrap my name in a link to https://github.com/remcostoeten).
     - A `●` that acts as a divider
     - The latest commit message + date (static for now)





Make for the desktop app a aesthetic  minimal footer which has the project name (pulled from a cfg file), has the version number (let's start on  0.1 and increment 0.01 each commit we do)- CREATE THIS FUNCTIONALLITY, IT DOESN"t EXIST yet.
````
