op2We want for the desktop application a aesthetic minimal footer which displays information about the app. This consists of multiple tasks which I want you to do:bbbbbbb                          1111

1. Create the footer component via proper semantics, render (for this part) static text to define the ui.

- a `<footer></footer>` element that is 100vw and has two sections it which are `justify-between` making the left aligned and the right aligned.-
- The left section should contain:
    - The application name (pulled from a cfg file)
    - A `●` that acts as a divider
    - The version number (static for this part)
- The right section should contain:
    - `Built with ❤️  by Remco Stoeten` (remco stoeten is the author, should be pulled from a cfg file. Wrap my name in a link to https://github.com/remcostoeten).
    - A `●` that acts as a divider
    - The latest commit message + date (static for now)

```
Then o nce it exists make data dynamic and pull from git remote etc. incrment 0.01 each commit
```
