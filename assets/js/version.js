const showScriptBtn = document.getElementById("showScriptBtn");
const scriptContent = document.getElementById("scriptContent");

// Tout le script version.sh (tu mets ici ton code complet entre backticks)
const versionShCode = `#!/bin/dash

COMMAND=$1
if test $# -eq 1;then
    if test "$COMMAND" = "--help";then
        echo 'Usage:'>&2
        echo '  ./version.sh --help'>&2
        echo '  ./version.sh <command> FILE [OPTION]'>&2
        echo '  where <command> can be: add amend checkout|co commit|ci diff log reset rm'>&2
        echo ' '>&2
        echo './version.sh add FILE MESSAGE'>&2
        echo '  Add FILE under versioning with the initial log message MESSAGE'>&2
        echo ' '>&2
        echo './version.sh commit|ci FILE MESSAGE'>&2
        echo '  Commit a new version of FILE with the log message MESSAGE'>&2
        echo ' '>&2
        echo './version.sh amend FILE MESSAGE'>&2
        echo '  Modify the last registered version of FILE, or (inclusive) its log message'>&2
        echo ' '>&2
        echo './version.sh checkout|co FILE [NUMBER]'>&2
        echo '  Restore FILE in the version NUMBER indicated, or in the'>&2
        echo '  latest version if there is no number passed in argument'>&2
        echo ' '>&2
        echo './version.sh diff FILE'>&2
        echo '  Displays the difference between FILE and the last committed version'>&2
        echo ' '>&2
        echo './version.sh log FILE'>&2
        echo '  Displays the logs of the versions already committed'>&2
        echo ' '>&2
        echo './version.sh reset FILE NUMBER'>&2
        echo '  Restores FILE in the version NUMBER indicated and'>&2
        echo '  deletes the versions of number strictly superior to NUMBER'>&2
        echo ' '>&2
        echo './version.sh rm FILE'>&2
        echo '  Deletes all versions of a file under versioning'>&2
        exit 1
    fi
fi

if test "$COMMAND" = "add";then
    if test $# -ne 3;then
        echo "The number of argument isn't correct">&2
        echo 'Enter "./version.sh --help" for more information.'>&2
        exit 1
    fi
    FILE=$2
    MESSAGE=$3
    if ! test -f "$FILE" || ! test -r "$FILE";then
        echo "$FILE is not a regular file or read permission is not granted.">&2
        echo 'Enter "./version.sh --help" for more information.'>&2
        exit 1
    fi
    if test -z "$MESSAGE";then
        echo "Cannot contain a empty string">&2
        echo 'Enter "./version.sh --help" for more information.'>&2
        exit 1
    fi
    if echo "$MESSAGE" | grep -E '^[ ]*$';then
        echo "Cannot contain only spaces">&2
        echo 'Enter "./version.sh --help" for more information.'>&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")
    if ! test -d "$DIR/.version";then
        mkdir -p "$DIR/.version"
    else
        echo 'Error! .version has already been created' >&2
        exit 1
    fi
    DATE=$(date)
    cp "$FILE" "$DIR/.version/$FILE_NAME.1"
    cp "$FILE" "$DIR/.version/$FILE_NAME.latest"
    touch "$DIR/.version/$FILE_NAME.log"
    echo "Added a new file under versioning: \"$FILE\""
    echo "$DATE \"$MESSAGE\"" >> "$DIR/.version/$FILE_NAME.log"
fi

if test "$COMMAND" = "rm";then  
    if test $# -ne 2;then
        echo "Error! The number of arguments isn't correct." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    FILE=$2
    if ! test -f "$FILE" || ! test -r "$FILE";then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")
    if ! test -d "$DIR/.version"; then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    if ! ls "$DIR/.version/$FILE_NAME."* >/dev/null 2>&1;then
        echo "Error! \"$FILE\" is not under versioning." >&2
        exit 1
    fi
    echo "Are you sure you want to delete \"$FILE\" from versioning ? (yes/no) "
    read ANSWER
    case "$ANSWER" in
        yes)
            rm -f "$DIR/.version/$FILE_NAME."*
            rmdir "$DIR/.version"
            echo "\"$FILE\" is not under versioning anymore."
            ;;
        no)
            echo "Nothing done."
            ;;
        *)
            echo "Invalid answer. Nothing done."
            ;;
    esac
fi

if test "$COMMAND" = "commit" || test "$COMMAND" = "ci";then
    if test $# -ne 3;then   
        echo "Error! The number of arguments isn't correct.">&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    FILE=$2
    MESSAGE=$3
    if ! test -f "$FILE" || ! test -r "$FILE" ;then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted.">&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    if test -z "$MESSAGE";then
        echo "Cannot contain a empty string">&2
        echo 'Enter "./version.sh --help" for more information.'>&2
        exit 1
    fi
    if echo "$MESSAGE" | grep -E '^[ ]*$';then
        echo "Cannot contain only spaces">&2
        echo 'Enter "./version.sh --help" for more information.'>&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")
    if ! test -d "$DIR/.version"; then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    if ! ls "$DIR/.version/$FILE_NAME."* >/dev/null 2>&1;then
        echo "Error! \"$FILE\" is not under versioning." >&2
        exit 1
    fi
    if cmp "$FILE" "$DIR/.version/$FILE_NAME.latest" 2>/dev/null;then
        echo "Nothing to commit: \"$FILE\" is identical to the latest version.">&2
        exit 1
    fi
    VERSION=$(ls "$DIR/.version/$FILE_NAME."[0-9]* 2>/dev/null | sed -E "s/.*$FILE_NAME\.//" | sort -n | tail -n 1)
    if test -z "$VERSION";then
        VERSION=1
    fi
    NEW=$((VERSION + 1))
    DATE=$(date)
    diff -u "$DIR/.version/$FILE_NAME.latest" "$FILE" > "$DIR/.version/$FILE_NAME.$NEW"
    cp "$FILE" "$DIR/.version/$FILE_NAME.latest"
    echo "Committed a new version: $NEW"
    echo "$DATE \"$MESSAGE\"" >> "$DIR/.version/$FILE_NAME.log"
fi

if test "$COMMAND" = "diff";then
    if test $# -ne 2;then
        echo "Error! The number of arguments isn't correct.">&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    FILE=$2
    if ! test -f "$FILE" || ! test -r "$FILE" ;then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted.">&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")
    if ! test -d "$DIR/.version"; then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    if ! ls "$DIR/.version/$FILE_NAME".* >/dev/null 2>&1;then
        echo "Error! \"$FILE\" is not under versioning." >&2
        exit 1
    fi
    VERSION=$(ls "$DIR/.version/$FILE_NAME."[0-9]* | sed -E "s/.*$FILE_NAME\.//" | sort -n | tail -n 1)
    if test -z "$VERSION";then
        VERSION=1
    fi
    NEW=$(($VERSION+1))
    diff -u "$DIR/.version/$FILE_NAME.$VERSION" "$FILE"
fi

if test "$COMMAND" = "checkout" || test "$COMMAND" = "co"; then
    if test $# -lt 2 || test $# -gt 3; then
        echo "Error! The number of arguments isn't correct." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi

    FILE=$2
    if ! test -f "$FILE" || ! test -r "$FILE"; then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi

    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")

    if ! test -d "$DIR/.version"; then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi

    if ! ls "$DIR/.version/$FILE_NAME".[0-9]* >/dev/null 2>&1; then
        echo "Error! \"$FILE\" is not under versioning." >&2
        exit 1
    fi

    VERSION=$(ls "$DIR/.version/$FILE_NAME".[0-9]* | sed -E "s/.*$FILE_NAME\.//" | sort -n | tail -n 1)
    if test $# -eq 3; then
        NUMBER=$3
    else
        NUMBER=$VERSION
        cp "$DIR/.version/$FILE_NAME.latest" "$FILE"
        echo "Checked out to version $NUMBER"
        exit 0
    fi
    if test -z "$NUMBER" || echo "$NUMBER" | grep -q '[^0-9]'; then
        echo "Error! Invalid version number." >&2
        exit 1
    fi

    if test "$NUMBER" -gt "$VERSION"; then
        echo "Error! Number is greater than the last commit version" >&2
        exit 1
    elif test "$NUMBER" -lt 1; then
        echo "Error! Number cannot be less than 1" >&2
        exit 1
    fi
    if test "$VERSION" -eq 1; then
        cp "$DIR/.version/$FILE_NAME.1" "$FILE"
        echo "Checked out to version 1"
        exit 0
    fi
    if ! echo "$NUMBER" | grep -Eq '^[0-9]+$'; then
        echo "Error! Invalid version number: $NUMBER" >&2
        exit 1
    fi

    cp "$DIR/.version/$FILE_NAME.1" "$FILE"
    i=2
    while test "$i" -le "$NUMBER"; do
        if test -f "$DIR/.version/$FILE_NAME.$i"; then
            patch -u "$FILE" "$DIR/.version/$FILE_NAME.$i" >/dev/null 2>&1
        else
            echo "Error! Missing patch $i" >&2
            exit 1
        fi
        i=$((i + 1))
    done
    if test "$NUMBER" -eq "$VERSION"; then
        echo "Checked out to the latest version"
    else
        echo "Checked out version: $NUMBER"
    fi
fi

if test "$COMMAND" = "log";then
    if test $# -ne 2;then
        echo "Error! The number of arguments isn't correct.">&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    FILE=$2
    if ! test -f "$FILE" || ! test -r "$FILE";then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")
    if ! test -d "$DIR/.version";then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    if ! test -f "$DIR/.version/$FILE_NAME.log"; then
        echo "Error! No log found for \"$FILE\"." >&2
        exit 1
    fi
    nl -s ' : ' "$DIR/.version/$FILE_NAME.log"
fi

if test "$COMMAND" = "reset";then
    if test $# -ne 3;then
        echo "Error! The number of arguments isn't correct." >&2
        echo 'Enter "./version.sh --help" for more information.' >&2
        exit 1
    fi
    FILE=$2
    NUMBER=$3
    if ! test -f "$FILE" || ! test -r  "$FILE";then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted." >&2
        exit 1
    fi
    if ! echo "$NUMBER" | grep -Eq '^[0-9]+$';then
        echo "Error! Version number must be a positive integer." >&2
        exit 1
    fi
    if test "$NUMBER" -lt 1; then
        echo "Error! Version number must be at least 1." >&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE") 
    if ! test -d "$DIR/.version";then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        exit 1
    fi
    VERSION=$(ls "$DIR/.version/$FILE_NAME".[0-9]* 2>/dev/null | sed -E "s/.*$FILE_NAME\.//" | sort -n | tail -n 1)
    if test -z "$VERSION";then
        echo "Error! \"$FILE\" is not under versioning." >&2
        exit 1
    fi
    if test "$NUMBER" -gt "$VERSION";then
        echo "Error! Version $NUMBER does not exist">&2
        exit 1
    fi
    if test "$NUMBER" -eq "$VERSION";then
        patch -u "$FILE" "$DIR/.version/$FILE_NAME.$NUMBER" >/dev/null 2>&1
        echo "Checked out to the latest version"
        exit 0
    fi
    echo "Are you sure you want to reset \"$FILE\" to version $NUMBER ? (yes/no) "
    read ANSWER
    case "$ANSWER" in
        yes)
            cp "$DIR/.version/$FILE_NAME.1" "$FILE"
            i=2
            while test "$i" -lt "$NUMBER";do
                if test -f "$DIR/.version/$FILE_NAME.$i";then
                    patch -u "$FILE" "$DIR/.version/$FILE_NAME.$i" >/dev/null 2>&1
                else
                    echo "Error! Missing patch $i" >&2
                    exit 1
                fi
                i=$((i+1))
            done
            echo "Reset to version: $NUMBER"
            i=$((NUMBER + 1))
            count=0
            while test "$i" -le "$LAST_VERSION";do
                if test -f "$DIR/.version/$FILE_NAME.$i"; then
                    rm -f "$DIR/.version/$FILE_NAME.$i"
                    count=$((count + 1))
                fi
                i=$((i + 1))
            done
            head -n "$NUMBER" "$DIR/.version/$FILE_NAME.log" > "$DIR/.version/$FILE_NAME.log.tmp"
            mv "$DIR/.version/$FILE_NAME.log.tmp" "$DIR/.version/$FILE_NAME.log"
            cp "$FILE" "$DIR/.version/$FILE_NAME.latest"
            if test "$count" -gt 0; then
                echo "Deleted $count version(s) higher than $NUMBER."
            fi
            ;;
        no)
            echo "Reset cancelled."
            ;;
        *)
            echo "Invalid answer. Nothing done."
            ;;
    esac
fi

if test "$COMMAND" = "amend";then
    if test $# -ne 3;then
        echo "Error! The number of arguments isn't correct." >&2
        echo 'Usage: ./version.sh amend FILE MESSAGE' >&2
        exit 1
    fi
    FILE=$2
    MESSAGE=$3
    if ! test -f "$FILE" || ! test -r "$FILE"; then
        echo "Error! \"$FILE\" is not a regular file or read permission is not granted." >&2
        exit 1
    fi
    if test -z "$MESSAGE";then
        echo "Cannot contain a empty string" >&2
        exit 1
    fi
    if echo "$MESSAGE" | grep -E '^[ ]*$';then
        echo "Cannot contain only spaces" >&2
        exit 1
    fi
    DIR=$(dirname "$FILE")
    FILE_NAME=$(basename "$FILE")
    if ! test -d "$DIR/.version"; then
        echo "Error! No .version directory found in \"$DIR\"." >&2
        exit 1
    fi
    VERSION=$(ls "$DIR/.version/$FILE_NAME".[0-9]* 2>/dev/null | sed -E "s/.*$FILE_NAME\.//" | sort -n | tail -n 1)
    if test -z "$VERSION"; then
        echo "Error! \"$FILE\" has no committed versions." >&2
        exit 1
    fi
    PREV=$((VERSION-1))
    if test "$VERSION" -eq 1; then
        cp "$FILE" "$DIR/.version/$FILE_NAME.1"
    else
        diff -u "$DIR/.version/$FILE_NAME.$PREV" "$FILE" > "$DIR/.version/$FILE_NAME.$VERSION"
    fi
    LOG_FILE="$DIR/.version/$FILE_NAME.log"
    TMP_FILE="$LOG_FILE.tmp"
    i=1
    while IFS= read -r line; do
        if test "$i" -eq "$VERSION"; then
            DATE=$(date)
            echo "$DATE \"$MESSAGE\"" >> "$TMP_FILE"
        else
            echo "$line" >> "$TMP_FILE"
        fi
        i=$((i+1))
    done < "$LOG_FILE"
    mv "$TMP_FILE" "$LOG_FILE"
    cp "$FILE" "$DIR/.version/$FILE_NAME.latest"
    echo "Latest version amended: $VERSION"
fi
`;

showScriptBtn.addEventListener("click", () => {
    scriptContent.style.display = "block";
    scriptContent.textContent = versionShCode; // affiche tout le code d’un coup
});