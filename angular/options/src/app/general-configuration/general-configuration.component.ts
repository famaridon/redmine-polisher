import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from '../configuration.service';

@Component({
  selector: 'app-general-configuration',
  templateUrl: './general-configuration.component.html',
  styleUrls: ['./general-configuration.component.css']
})
export class GeneralConfigurationComponent implements OnInit {

  public redmineAPIKey : string;
  private configurationService : ConfigurationService

  constructor(configurationService : ConfigurationService) {
    this.configurationService = configurationService;
  }

  ngOnInit() {
    this.load();
  }

  public reset(): void{
    console.debug("reset configuration");
    this.load();
  }

  public submit(): void{
    console.debug("submit configuration");
    this.save();
  }

  protected load(): void {
    this.configurationService.getOptionValue("redmineAPIKey").then((redmineAPIKey) => {debugger; this.redmineAPIKey = redmineAPIKey});
    return;
  }

  protected async save(): Promise<void> {
    await this.configurationService.saveOptionValue("redmineAPIKey", this.redmineAPIKey);
  }


}
