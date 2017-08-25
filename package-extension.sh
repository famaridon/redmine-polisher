#! /bin/bash
rm -f redmine-polisher.zip
zip -9 -r --exclude=*.sh --exclude=*.git* redmine-polisher.zip *
