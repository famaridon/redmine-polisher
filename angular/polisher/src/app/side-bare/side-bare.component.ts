import { Component, OnInit } from '@angular/core';
import { SideBareService, Query} from '../side-bare.service';

@Component({
  selector: 'app-side-bare',
  templateUrl: './side-bare.component.html',
  styleUrls: ['./side-bare.component.css']
})
export class SideBareComponent implements OnInit {

  private sideBareService : SideBareService;
  public queries : Array<Query>;

  constructor(sideBareService : SideBareService) {
    this.sideBareService = sideBareService;
  }

  ngOnInit() {
    this.queries = this.sideBareService.queries;
  }

}
